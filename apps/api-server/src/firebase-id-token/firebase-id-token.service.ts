import { authToken } from '@flocon-trpg/core';
import { Result } from '@kizahasi/result';
import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import admin from 'firebase-admin';
import { Context } from 'graphql-ws';
import { BaasType } from '../enums/BaasType';

// テスト用の値を作成しやすいように、admin.auth.DecodedIdToken は必要な値のみ pick している。
export type DecodedIdToken = Pick<admin.auth.DecodedIdToken, 'uid'> & {
    firebase: Pick<admin.auth.DecodedIdToken['firebase'], 'sign_in_provider'>;
} & {
    // 将来 Firebase 以外にも対応するかもしれない
    type: BaasType.Firebase;
};

const getDecodedIdToken = async (idToken: string): Promise<Result<DecodedIdToken, unknown>> => {
    const decodedIdToken = await admin
        .auth()
        .verifyIdToken(idToken)
        .then(Result.ok)
        .catch(Result.error);
    if (decodedIdToken.isError) {
        return decodedIdToken;
    }
    return Result.ok({
        ...decodedIdToken.value,
        type: BaasType.Firebase,
    });
};

const getDecodedIdTokenFromBearer = async (
    bearer: string | undefined,
): Promise<Result<DecodedIdToken, unknown> | undefined> => {
    // bearerのフォーマットはだいたいこんな感じ
    // 'Bearer aNGoGo3ngC.oepGJoGoeo34Ha.Oge03mvQgeo4H'
    if (bearer == null || !bearer.startsWith('Bearer ')) {
        return undefined;
    }
    const idToken = bearer.replace('Bearer ', '');
    return await getDecodedIdToken(idToken);
};

// 当初はこのクラスをテストで置き換えられると便利だと思い Service にしたが、現時点では置き換えていないため Service にする必要はないかもしれない。
@Injectable()
export class FirebaseIdTokenService {
    public async getDecodedIdTokenFromHeaders(
        headers: Readonly<Record<string, string | undefined>>,
    ): Promise<Result<DecodedIdToken, HttpException>> {
        const authorizationHeader = headers.authorization;
        if (authorizationHeader == null) {
            return Result.error(new UnauthorizedException('authorization header is required'));
        }

        const result = await getDecodedIdTokenFromBearer(authorizationHeader);
        if (result == null) {
            return Result.error(new UnauthorizedException('Bearer error'));
        }

        if (result.isError) {
            return Result.error(new UnauthorizedException('Authorization failure'));
        }

        return result;
    }

    public async getDecodedIdTokenFromWsContext(
        ctx: Context,
    ): Promise<Result<DecodedIdToken, unknown> | undefined> {
        let authTokenValue: string | undefined;
        if (ctx.connectionParams != null) {
            const authTokenValueAsUnknown = ctx.connectionParams[authToken];
            if (typeof authTokenValueAsUnknown === 'string') {
                authTokenValue = authTokenValueAsUnknown;
            }
        }
        return authTokenValue == null ? undefined : await getDecodedIdToken(authTokenValue);
    }
}
