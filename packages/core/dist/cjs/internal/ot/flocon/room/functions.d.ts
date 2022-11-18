import { State, TwoWayOperation, UpOperation } from '../../generator';
import { RequestedBy } from '../../requestedBy';
import { ServerTransform } from '../../util/type';
import { template } from './types';
/**
 * Stateから、指定されたユーザーが閲覧できないデータを取り除いた新しいStateを返す。
 * @param requestedBy - 生成されたStateを渡すユーザーの種類。権限を確認するために用いられる。
 */
export declare const toClientState: (requestedBy: RequestedBy) => (source: State<typeof template>) => State<typeof template>;
/**
 * クライアントによる変更の要求を表すOperationを受け取り、APIサーバーのStateに対してapplyできる状態のOperationに変換して返す。変換処理では、主に次の2つが行われる。
 * - クライアントから受け取ったOperationのうち、不正なもの（例: そのユーザーが本来削除できないはずのキャラクターを削除しようとする）を取り除く
 * - 編集競合が発生している場合は解決する
 *
 * @param requestedBy - 変更を要求したユーザーの種類。権限を確認するために用いられる。
 * @param prevState - クライアントが推測する最新のState。
 * @param currentState - APIサーバーにおける実際の最新のState。
 * @param serverOperation - `prevState`と`currentState`のDiff。`prevState`と`currentState`が等しい場合はundefined。
 * @param clientOperation - クライアントが要求している変更。
 */
export declare const serverTransform: (requestedBy: RequestedBy) => ServerTransform<State<typeof template>, TwoWayOperation<typeof template>, UpOperation<typeof template>>;
//# sourceMappingURL=functions.d.ts.map