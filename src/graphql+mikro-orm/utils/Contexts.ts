import { Result } from '@kizahasi/result';
import { InMemoryConnectionManager } from '../../connection/main';
import { BaasType } from '../../enums/BaasType';
import { PromiseQueue } from '../../utils/promiseQueue';
import { EM } from '../../utils/types';
import { User } from '../entities/user/mikro-orm';

// admin.auth.DecodedIdTokenから必要な要素だけを抽出したもの
export type DecodedIdToken = {
    type: BaasType.Firebase;
    uid: string;
    firebase: {
        sign_in_provider: string;
    };
};

export type ResolverContext = {
    readonly decodedIdToken?: Result<Readonly<DecodedIdToken>, unknown>;
    readonly promiseQueue: PromiseQueue;
    readonly connectionManager: InMemoryConnectionManager;

    // 原則としてfork済みなので、forkする必要はない。
    // @Authorizedの処理で用いたEMと同じインスタンス。理由は、authorizedUserをManyToOneなどでセットする際に、もしEMが異なっているとエラーが出るかもしれないと思ったから（未検証）。
    readonly em: EM;

    // @Authorizedを使用 ⇔ これがnon-null
    // Authorized属性を通してセットされる
    authorizedUser: User | null;
};
