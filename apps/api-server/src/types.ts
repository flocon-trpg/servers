import { Result } from '@kizahasi/result';
import { Connection, EntityManager, IDatabaseDriver, MikroORM } from '@mikro-orm/core';
import { RateLimiterAbstract } from 'rate-limiter-flexible';
import { ServerConfig } from './config/types';
import { InMemoryConnectionManager } from './connection/main';
import { User } from './entities/user/entity';
import { BaasType } from './enums/BaasType';
import { PromiseQueue } from './utils/promiseQueue';

export type EM = EntityManager<IDatabaseDriver<Connection>>;
export type ORM = MikroORM<IDatabaseDriver<Connection>>;

// Firebase Admin SDK の admin.auth.DecodedIdTokenから必要な要素だけを抽出したもの
export type DecodedIdToken = {
    type: BaasType.Firebase;
    uid: string;
    firebase: {
        sign_in_provider: string;
    };
};

export type ResolverContext = {
    // TODO: decodedIdTokenが必要ない場面でもFirebaseから取得するため、無駄がある。
    readonly decodedIdToken?: Result<Readonly<DecodedIdToken>, unknown>;

    // DecodedIdTokenをキーとしている。IPアドレスをキーにしたrate limitは、nginxなどのほうで行ってもらうことを現時点では想定。
    // nullの場合はrate limitは一切行わない。
    readonly rateLimiter: RateLimiterAbstract | null;

    readonly promiseQueue: PromiseQueue;
    readonly connectionManager: InMemoryConnectionManager;
    readonly serverConfig: Readonly<ServerConfig>;

    // 原則としてfork済みなので、forkする必要はない。
    // @Authorizedの処理で用いたEMと同じインスタンス。理由は、authorizedUserをManyToOneなどでセットする際に、もしEMが異なっているとエラーが出るかもしれないと思ったから（未検証）。
    readonly em: EM;

    /**
     * \@Authorizedを使用していてなおかつENTRY以上 ⇔ これがnon-null。authChecker関数を通して自動的にセットされる。 */
    authorizedUser: User | null;
};
