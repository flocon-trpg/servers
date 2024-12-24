import { State, TwoWayOperation, UpOperation } from '../../generator/types';
import { RequestedBy } from '../../requestedBy';
import { ServerTransform } from '../../util/type';
import { template } from './types';
/**
 * Stateから、指定されたユーザーが閲覧できないデータを取り除いた新しいStateを返す。
 * @param requestedBy 生成されたStateを渡すユーザーの種類。権限を確認するために用いられる。
 */
export declare const toClientState: (requestedBy: RequestedBy) => (source: State<typeof template>) => State<typeof template>;
/**
 * クライアントによる変更の要求を表すOperationを受け取り、APIサーバーのStateに対してapplyできる状態のOperationに変換して返す。変換処理では、主に次の2つが行われる。
 * - クライアントから受け取ったOperationのうち、不正なもの（例: そのユーザーが本来削除できないはずのキャラクターを削除しようとする）があった場合に、取り除くか拒否してエラーを返す
 * - 編集競合が発生している場合は解決する
 *
 * @param requestedBy 変更を要求したユーザーの種類。権限を確認するために用いられる。
 * @param stateBeforeServerOperation クライアントがStateを変更しようとしたときに用いられたState。
 * @param stateAfterServerOperation APIサーバーにおける実際の最新のState。
 * @param serverOperation `stateBeforeServerOperation`と`stateAfterServerOperation`のDiff。`stateBeforeServerOperation`と`stateAfterServerOperation`が等しい場合はundefined。
 * @param clientOperation クライアントが要求している変更。
 * @returns `stateAfterServerOperation`に対してapplyできる状態のOperation。
 */
export declare const serverTransform: (requestedBy: RequestedBy) => ServerTransform<State<typeof template>, TwoWayOperation<typeof template>, UpOperation<typeof template>>;
//# sourceMappingURL=functions.d.ts.map