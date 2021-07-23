import { CustomResult } from '@kizahasi/result';
import { InMemoryConnectionManager } from '../../connection/main';
import { BaasType } from '../../enums/BaasType';
import { PromiseQueue } from '../../utils/PromiseQueue';
import { EM } from '../../utils/types';

// admin.auth.DecodedIdTokenから必要な要素だけを抽出したもの
export type DecodedIdToken = {
    type: BaasType.Firebase;
    uid: string;
    firebase: {
        sign_in_provider: string;
    };
};

export type ResolverContext = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    decodedIdToken?: CustomResult<DecodedIdToken, any>;
    promiseQueue: PromiseQueue;
    connectionManager: InMemoryConnectionManager;
    createEm: () => EM;
};
