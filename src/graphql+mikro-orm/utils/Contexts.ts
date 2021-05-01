
import admin from 'firebase-admin';
import { CustomResult } from '../../@shared/Result';
import { InMemoryConnectionManager } from '../../connection/main';
import { PromiseQueue } from '../../utils/PromiseQueue';
import { EM } from '../../utils/types';

// admin.auth.DecodedIdTokenから必要な要素だけを抽出したもの
export type DecodedIdToken = {
    uid: string;
    firebase: {
        sign_in_provider: string;
    };
}

export type ResolverContext = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    decodedIdToken?: CustomResult<DecodedIdToken, any>;
    promiseQueue: PromiseQueue;
    connectionManager: InMemoryConnectionManager;
    createEm: () => EM;
}