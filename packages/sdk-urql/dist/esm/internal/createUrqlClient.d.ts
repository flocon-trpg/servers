import { IdTokenResult } from '@firebase/auth';
import { Exchange } from 'urql';
type GetUserIdTokenResult = (() => Promise<IdTokenResult | null>) | null;
type Params = {
    /** API サーバーの HTTP もしくは HTTPS での URL。通常は `https://` もしくは `http://` で始まる文字列です。 */
    httpUrl: string;
    /** API サーバーの WebSocket の URL。通常は `wss://` もしくは `ws://` で始まる文字列です。 */
    wsUrl: string;
    exchanges?: (defaultExchanges: Exchange[]) => Exchange[];
} & ({
    /**
     * `false` ならば、常に Authorization ヘッダーなしで API サーバーにリクエストします。API サーバーからはログインしていないユーザーだとみなされます。
     *
     * ユーザーがログインしているか否かに関わらず、通常は `true` をセットすることを推奨します。
     */
    authorization: false;
} | {
    /**
     * `true` ならば、可能であれば Authorization ヘッダーありで API サーバーにリクエストします。
     *
     * 有効な Authorization ヘッダーがある場合は、API サーバーからはログインしているユーザーだとみなされます。ただし、Authorization ヘッダーにセットする値を GetUserIdTokenResult から取得できなかった場合は、Authorization ヘッダーなしでリクエストします。この場合はログインしていないユーザーだとみなされます。
     */
    authorization: true;
    getUserIdTokenResult: GetUserIdTokenResult;
});
export declare const createUrqlClient: (params: Params) => import("urql").Client;
export {};
//# sourceMappingURL=createUrqlClient.d.ts.map