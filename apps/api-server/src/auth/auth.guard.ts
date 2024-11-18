import { authToken } from '@flocon-trpg/core';
import { Result } from '@kizahasi/result';
import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    HttpException,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
    createParamDecorator,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { z } from 'zod';
import { BaasType } from '../enums/BaasType';
import {
    DecodedIdToken,
    FirebaseIdTokenService,
} from '../firebase-id-token/firebase-id-token.service';
import { User } from '../mikro-orm/entities/user/entity';
import { MikroOrmService } from '../mikro-orm/mikro-orm.service';
import { ServerConfig, ServerConfigService } from '../server-config/server-config.service';
import { parseExecutionContext } from '../utils/parseExecutionContext';
import { AuthStatus } from './auth-status.decorator';
import { ADMIN, Auth, ENTRY, LOGIN, NONE, RoleType } from './auth.decorator';

const authDataKey = 'authData';
const authStatusDataKey = 'authStatusData';

const GET_AUTH_STATUS = 'GET_AUTH_STATUS';

// type 以外は、Firebase Admin SDK の admin.auth.DecodedIdToken から必要な要素だけを抽出したもの。`signInProvider` でなく `sign_in_provider` となっているのはそれが理由。
type DecodedIdTokenType = {
    type: BaasType.Firebase;
    firebase: {
        sign_in_provider: string;
    };
};

type UserType = Pick<User, 'baasType' | 'isEntry' | 'userUid'>;

export type AuthDataType = {
    user: UserType;
} & DecodedIdTokenType;

type AuthStatusUserDataType =
    | {
          user: UserType;
      }
    | {
          user: null;
          userUid: string;
      };

export type AuthStatusDataType = Result<AuthStatusUserDataType & DecodedIdTokenType, HttpException>;

const stringRecordSchema = z.record(z.string());

const isRolePermitted = ({
    user,
    requiredRole,
    serverConfig,
}: {
    user: UserType;
    requiredRole: typeof ADMIN | typeof ENTRY | typeof LOGIN | undefined;
    serverConfig: ServerConfig;
}): boolean => {
    switch (requiredRole) {
        case undefined:
        case LOGIN:
            return true;
        case ENTRY:
            return user.isEntry;
        case ADMIN:
            return serverConfig.admins.includes(user.userUid);
    }
};

@Injectable()
export class AuthGuard implements CanActivate {
    readonly #reflector: Reflector;
    readonly #serverConfigService: ServerConfigService;
    readonly #mikroOrmService: MikroOrmService;
    readonly #firebaseIdTokenService: FirebaseIdTokenService;

    constructor(
        reflector: Reflector,
        serverConfigService: ServerConfigService,
        mikroOrmService: MikroOrmService,
        firebaseIdTokenService: FirebaseIdTokenService,
    ) {
        this.#reflector = reflector;
        this.#serverConfigService = serverConfigService;
        this.#mikroOrmService = mikroOrmService;
        this.#firebaseIdTokenService = firebaseIdTokenService;
    }

    // もともと `@AuthStatus` に相当する処理は Service に書きたかったが、ExecutionContext は Service 等からは利用できないようなので、`@Auth` と `@AuthStatus` の処理を両方ともここに書いている。
    // canActivate 関数で false を返すと Forbidden エラーとして処理される(https://docs.nestjs.com/guards#putting-it-all-together の下のほう)。
    async canActivate(context: ExecutionContext): Promise<true> {
        const serverConfig = this.#serverConfigService.getValueForce();

        // 対応するデコレーターがない場合は Reflector.get の戻り値は undefined になるが、戻り値の型にはバグなのか undefined が含まれていないので対応している。
        const requiredRole = this.#reflector.get(Auth, context.getHandler()) satisfies RoleType as
            | RoleType
            | undefined;
        const getAuthStatus = this.#reflector.get(AuthStatus, context.getHandler()) ?? false;

        if (getAuthStatus && requiredRole != null) {
            throw new InternalServerErrorException(
                'This might be a bug. You cannot use @Auth and @GetAuthDataForce at the same time.',
            );
        }

        const authGuardStrategy = getAuthStatus ? GET_AUTH_STATUS : requiredRole;

        if (authGuardStrategy == null || authGuardStrategy === NONE) {
            return true;
        }
        const parsedExecutionContext = parseExecutionContext(context);

        let decodedIdTokenValue: Result<DecodedIdToken, HttpException>;
        switch (parsedExecutionContext.type) {
            case 'rpc':
            case 'ws': {
                throw new BadRequestException();
            }
            case 'http':
            case 'graphql': {
                const headers = await stringRecordSchema.safeParseAsync(
                    parsedExecutionContext.request?.headers,
                );
                if (!headers.success) {
                    decodedIdTokenValue = Result.error(
                        new InternalServerErrorException(
                            'type validation error at request.headers',
                        ),
                    );
                    break;
                }
                const decodedIdToken =
                    await this.#firebaseIdTokenService.getDecodedIdTokenFromHeaders(
                        headers.data ?? {},
                    );
                if (decodedIdToken.isError) {
                    decodedIdTokenValue = decodedIdToken;
                    break;
                }
                decodedIdTokenValue = Result.ok(decodedIdToken.value);
                break;
            }
            case 'graphql-ws': {
                const decodedIdToken =
                    await this.#firebaseIdTokenService.getDecodedIdTokenFromWsContext(
                        parsedExecutionContext.request,
                    );
                if (decodedIdToken == null) {
                    decodedIdTokenValue = Result.error(
                        new UnauthorizedException(
                            `${authToken} is required at GraphQL subscription`,
                        ),
                    );
                    break;
                }
                if (decodedIdToken.isError) {
                    decodedIdTokenValue = Result.error(
                        new UnauthorizedException('Authorization failure at GraphQL subscription'),
                    );
                    break;
                }
                decodedIdTokenValue = Result.ok(decodedIdToken.value);
                break;
            }
        }

        if (decodedIdTokenValue.isError) {
            if (authGuardStrategy === GET_AUTH_STATUS) {
                const authStatusData: AuthStatusDataType = decodedIdTokenValue;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                (parsedExecutionContext.request as any)[authStatusDataKey] = authStatusData;
                return true;
            } else {
                throw decodedIdTokenValue.error;
            }
        }

        const decodedIdTokenType: DecodedIdTokenType = {
            type: decodedIdTokenValue.value.type,
            firebase: { sign_in_provider: decodedIdTokenValue.value.firebase.sign_in_provider },
        };

        const em = await this.#mikroOrmService.forkEmForMain();

        // このコード内で User を find しているが、このコードは NestJS によって非同期で実行されるため、「見つからなかったら User を INSERT する」などといったクリティカルセクションとなる処理を書くと問題が発生しうることに注意すること。一見するとクライアントが Query や Mutation をしっかり1つ1つ await する信頼できる作りであれば問題なさそうだが、Subscription と他の operation を同時実行するときは問題が起こりうる。ただし、async-lock 等で排他制御するという手はある。
        const userEntity = await em.findOne(User, { userUid: decodedIdTokenValue.value.uid });
        const user =
            userEntity == null
                ? null
                : {
                      baasType: userEntity.baasType,
                      isEntry: userEntity.isEntry,
                      userUid: userEntity.userUid,
                  };

        if (authGuardStrategy === GET_AUTH_STATUS) {
            const authStatusUserData: AuthStatusUserDataType =
                user == null ? { user: null, userUid: decodedIdTokenValue.value.uid } : { user };
            const authStatusData: AuthStatusDataType = Result.ok({
                ...authStatusUserData,
                ...decodedIdTokenType,
            });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            (parsedExecutionContext.request as any)[authStatusDataKey] = authStatusData;
            return true;
        }

        if (user == null) {
            throw new ForbiddenException(
                'EntryToServer mutation must be executed before this operation',
            );
        }

        if (!isRolePermitted({ user, requiredRole: authGuardStrategy, serverConfig })) {
            throw new ForbiddenException('Role error');
        }
        const authData: AuthDataType = {
            user,
            ...decodedIdTokenType,
        };

        // 半ば無理やり値をセットしているが、これは NestJS のドキュメントに書かれている方法(https://docs.nestjs.com/security/authentication#implementing-the-authentication-guard)と同様。ただし、'graphql-ws' の場合は代わりに extra を利用してもいいかも。
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (parsedExecutionContext.request as any)[authDataKey] = authData;
        return true;
    }
}

const getAuthData = (context: ExecutionContext): AuthDataType | undefined => {
    const parsedExecutionContext = parseExecutionContext(context);
    switch (parsedExecutionContext.type) {
        case 'graphql':
        case 'graphql-ws':
        case 'http': {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
            return (parsedExecutionContext.request as any)[authDataKey];
        }
        case 'rpc':
        case 'ws': {
            return undefined;
        }
    }
};

const getAuthStatusData = (context: ExecutionContext): AuthStatusDataType | undefined => {
    const parsedExecutionContext = parseExecutionContext(context);
    switch (parsedExecutionContext.type) {
        case 'graphql':
        case 'graphql-ws':
        case 'http': {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
            return (parsedExecutionContext.request as any)[authStatusDataKey];
        }
        case 'rpc':
        case 'ws': {
            return undefined;
        }
    }
};

// AuthGuard を使っておりなおかつ @Auth(LOGIN以上) を付けた関数にこのデコレーターを使うことで値を取得できる。
// 通常であればこの関数は独立したファイルに書くべきだが、authDataKey を export しないようにするためにここに書いている
export const AuthData = createParamDecorator(
    (data: unknown, context: ExecutionContext): AuthDataType => {
        const authData = getAuthData(context);
        if (authData == null) {
            throw new InternalServerErrorException(
                'auth value is not found. This might be a bug. Forgot to use @Auth or AuthGuard?',
            );
        }
        return authData;
    },
);

// AuthGuard を使っておりなおかつ @GetAuthStatus(true) を付けた関数にこのデコレーターを使うことで値を取得できる。
// 通常であればこの関数は独立したファイルに書くべきだが、authStatusDataKey を export しないようにするためにここに書いている
export const AuthStatusData = createParamDecorator(
    (data: unknown, context: ExecutionContext): AuthStatusDataType => {
        const authData = getAuthStatusData(context);
        if (authData == null) {
            throw new InternalServerErrorException(
                'auth value is not found. This might be a bug. Forgot to use @GetAuthDataForce or AuthGuard?',
            );
        }
        return authData;
    },
);
