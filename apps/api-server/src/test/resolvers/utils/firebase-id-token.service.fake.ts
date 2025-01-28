import { Result } from '@kizahasi/result';
import { HttpException } from '@nestjs/common';
import { Context } from 'graphql-ws';
import { BaasType } from '../../../enums/BaasType';
import {
    DecodedIdToken,
    FirebaseIdTokenService,
} from '../../../firebase-id-token/firebase-id-token.service';
import { Resources } from './resources';

export class FirebaseIdTokenServiceFake
    implements
        Pick<
            FirebaseIdTokenService,
            'getDecodedIdTokenFromHeaders' | 'getDecodedIdTokenFromWsContext'
        >
{
    public async getDecodedIdTokenFromHeaders(
        headers: Readonly<Record<string, string | undefined>>,
    ): Promise<Result<DecodedIdToken, HttpException>> {
        const uid = headers[Resources.testAuthorizationHeader];
        if (uid == null) {
            throw new Error(`Test Error: ${Resources.testAuthorizationHeader} header is required`);
        }
        return Result.ok({
            uid,
            firebase: {
                sign_in_provider: 'FAKE_SIGN_IN_PROVIDER',
            },
            type: BaasType.Firebase,
        });
    }
    public async getDecodedIdTokenFromWsContext(
        ctx: Context,
    ): Promise<Result<DecodedIdToken, unknown> | undefined> {
        const uid = ctx.connectionParams?.[Resources.testAuthorizationHeader] as string | undefined;
        if (uid == null) {
            return undefined;
        }
        return Result.ok({
            uid,
            firebase: {
                sign_in_provider: 'FAKE_SIGN_IN_PROVIDER',
            },
            type: BaasType.Firebase,
        });
    }
}
