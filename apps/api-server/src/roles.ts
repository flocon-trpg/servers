import { ServerConfig } from './config/types';
import { BaasType } from './enums/BaasType';
import {
    NotSignIn,
    checkSignIn,
    getUserIfEntry,
} from './graphql+mikro-orm/resolvers/utils/helpers';
import { DecodedIdToken, ResolverContext } from './graphql+mikro-orm/utils/Contexts';

// configでadminに指定されているユーザー。現状ではentryも必要としているが、しなくてもOKという仕様に変更するかもしれない。
export const ADMIN = 'ADMIN';

// entryしているユーザー。
export const ENTRY = 'ENTRY';

export type RoleWithoutEntry = typeof ADMIN;
export type Role = RoleWithoutEntry | typeof ENTRY;

// @Authorizedに何も指定しなかった場合は、Firebase Authenticationでログインしているユーザー全員がアクセス可能となる。

type RolesParams =
    | {
          roles: ReadonlySet<Role>;
          isEntry?: undefined;
      }
    | {
          roles: ReadonlySet<RoleWithoutEntry>;
          isEntry: boolean;
      };

class Roles {
    #roles: ReadonlySet<Role>;

    public constructor(params: RolesParams) {
        // params.isEntry == null が成り立つときは下のコードの代わりに const roles = params.roles; にするほうがパフォーマンス上は少し有利だが、もしparams.rolesに破壊的な変更があった場合の挙動に違いがあると混乱を招くおそれがあるためこちらもSetをクローンしている。
        const roles = new Set<Role>(params.roles);
        if (params.isEntry === true) {
            roles.add(ENTRY);
        }
        this.#roles = roles;
    }

    public isPermitted(roles: readonly string[]): boolean {
        if (roles.includes(ADMIN)) {
            return this.#roles.has(ADMIN);
        }

        if (roles.includes(ENTRY)) {
            return this.#roles.has(ENTRY);
        }

        return true;
    }

    public get value() {
        return this.#roles;
    }
}

const getRolesCore = ({
    context,
    serverConfig,
}: {
    context: ResolverContext;
    serverConfig?: ServerConfig;
}): { roles: Set<RoleWithoutEntry>; decodedIdToken: DecodedIdToken } | typeof NotSignIn => {
    const roles = new Set<RoleWithoutEntry>();
    const decodedIdToken = checkSignIn(context);
    if (decodedIdToken === NotSignIn) {
        return NotSignIn;
    }

    const adminUserUids = (serverConfig ?? context.serverConfig).admins;

    if (adminUserUids.includes(decodedIdToken.uid)) {
        roles.add(ADMIN);
    }

    return { roles, decodedIdToken };
};

export const getRoles = (
    params: Parameters<typeof getRolesCore>[0] & {
        isEntry: boolean;
    }
): Roles | typeof NotSignIn => {
    const result = getRolesCore(params);
    if (result === NotSignIn) {
        return NotSignIn;
    }
    return new Roles({ roles: result.roles, isEntry: params.isEntry });
};

export const getRolesAndCheckEntry = async ({
    context,
    serverConfig,
    setAuthorizedUserToResolverContext,
}: {
    context: ResolverContext;
    serverConfig?: ServerConfig;
    setAuthorizedUserToResolverContext: boolean;
}): Promise<Roles | typeof NotSignIn> => {
    const rolesCoreResult = getRolesCore({ context, serverConfig });
    if (rolesCoreResult === NotSignIn) {
        return NotSignIn;
    }
    const result: Set<Role> = rolesCoreResult.roles;

    const user = await getUserIfEntry({
        em: context.em,
        userUid: rolesCoreResult.decodedIdToken.uid,
        baasType: BaasType.Firebase,
        serverConfig: serverConfig ?? context.serverConfig,
    });
    if (user == null) {
        return new Roles({ roles: result });
    }
    result.add(ENTRY);
    if (setAuthorizedUserToResolverContext) {
        context.authorizedUser = user;
    }
    return new Roles({ roles: result });
};
