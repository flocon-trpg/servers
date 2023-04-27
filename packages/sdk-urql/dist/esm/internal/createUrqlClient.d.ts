import { IdTokenResult } from '@firebase/auth';
import { createClient } from 'urql';
type GetUserIdTokenResult = (() => Promise<IdTokenResult | null>) | null;
type Exchanges = NonNullable<Parameters<typeof createClient>[0]['exchanges']>;
type Params = {
    /** API サーバーの HTTP もしくは HTTPS での URL。通常は `https://` もしくは `http://` で始まる文字列です。 */
    httpUrl: string;
    /** API サーバーの WebSocket の URL。通常は `wss://` もしくは `ws://` で始まる文字列です。 */
    wsUrl: string;
    exchanges?: (defaultExchanges: Exchanges) => Exchanges;
} & ({
    /**
     * 常に Authorization ヘッダーなしで API サーバーにリクエストします。API サーバーからはログインしていないユーザーだとみなされます。
     *
     * ユーザーがログインしているか否かに関わらず、通常は `true` をセットすることを推奨します。
     */
    authorization: false;
} | {
    /**
     * 可能であれば Authorization ヘッダーありで API サーバーにリクエストします。
     *
     * 有効な Authorization ヘッダーがある場合は、API サーバーからはログインしているユーザーだとみなされます。ただし、Authorization ヘッダーにセットする値を GetUserIdTokenResult から取得できなかった場合は、Authorization ヘッダーなしでリクエストします。この場合はログインしていないユーザーだとみなされます。
     */
    authorization: true;
    getUserIdTokenResult: GetUserIdTokenResult;
});
export declare const createUrqlClient: (params: Params) => import("@urql/core/dist/urql-core-chunk").Client;
export {};
//# sourceMappingURL=createUrqlClient.d.ts.map