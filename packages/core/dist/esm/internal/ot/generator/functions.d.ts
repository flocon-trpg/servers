import { Apply, ClientTransform, Compose, Diff, DownError, Restore } from '../util/type';
import { AnyTemplate, DownOperation, State, TwoWayOperation, UpOperation } from './types';
export declare const $v = "$v";
export declare const $r = "$r";
/** TwoWayOperationをUpOperationに変換します。 */
export declare const toUpOperation: <T extends AnyTemplate>(template: T) => (twoWayOperation: TwoWayOperation<T>) => UpOperation<T>;
/** TwoWayOperationをDownOperationに変換します。 */
export declare const toDownOperation: <T extends AnyTemplate>(template: T) => (twoWayOperation: TwoWayOperation<T>) => DownOperation<T>;
/** StateにUpOperationを適用します。破壊的な処理は行われません。 */
export declare const apply: <T extends AnyTemplate>(template: T) => Apply<State<T>, UpOperation<T>>;
/** StateにDownOperationを適用します。破壊的な処理は行われません。 */
export declare const applyBack: <T extends AnyTemplate>(template: T) => Apply<State<T>, DownOperation<T>>;
/** 連続する2つのDownOperationを合成します。破壊的な処理は行われません。 */
export declare const composeDownOperation: <T extends AnyTemplate>(template: T) => Compose<DownOperation<T>, DownError>;
/**
 * Stateの情報を用いて、DownOperationをTwoWayOperationに変換します。破壊的な処理は行われません。
 * @param nextState DownOperationが適用される前の状態のState。
 */
export declare const restore: <T extends AnyTemplate>(template: T) => Restore<State<T>, DownOperation<T>, TwoWayOperation<T>>;
/** 2つのStateオブジェクトの差分を取ります。
 * @returns 2つのオブジェクトが意味上で同一であればundefinedを返します。
 */
export declare const diff: <T extends AnyTemplate>(template: T) => Diff<State<T>, TwoWayOperation<T>>;
/**
 * ユーザーの権限を考慮せずに、通常のOperational Transformを行います。主にクライアント側で使われます。破壊的な処理は行われません。
 *
 * この関数は次の2つの制約があります。
 * - `first`適用前のStateと`second`適用前のStateは等しい。
 * - このStateに対して`first`と`secondPrime`を順に適用したStateと、`second`と`firstPrime`を順に適用したStateは等しい。
 *
 * Record の template の場合、state や operation に `$index` というキーのプロパティがある場合はIndexObject(配列の要素)であるとみなされ、`$index`を調整する operation が自動的に追加されることがあります。そのため、配列の要素とみなしたい場合を除いて`$index`というキーをオブジェクトに含めないようにしてください。
 */
export declare const clientTransform: <T extends AnyTemplate>(template: T) => ClientTransform<State<T>, UpOperation<T>>;
//# sourceMappingURL=functions.d.ts.map