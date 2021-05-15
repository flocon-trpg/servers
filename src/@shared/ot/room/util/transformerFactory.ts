import { CustomResult } from '../../../Result';
import { ProtectedValuePolicy } from './dualKeyRecordOperation';

// TransformerFactoryやそれに類するtypeのメリットは、Stateが実装すべき関数がわかりやすく示せること。問題点は、composeLooseなどのように編集権限がないものとtransformやprotectedValuePolicyなどのように編集権限のチェックが必要なものが混在しているため、例えばcomposeLooseだけ使いたいとなったときに少し困ること。
export type TransformerFactory<TKey, TServerState, TClientState, TDownOperation, TUpOperation, TTwoWayOperation, TCustomError = string> = {
    // stateが必要ないぶん処理を高速化&簡略化できる。
    // 一見、restoreを逐次実行していけば多少非効率なもののcomposeLooseは必要ないように思えるが、その場合はtransformも逐次実行していくかTTwoWayOperationをcomposeする必要性が出てくる。後者の場合はcomposeLooseを省略するというメリットが打ち消されるため却下。前者の場合は流石にパフォーマンスが気になってくるので却下したが、もしかすると問題ない可能性もある。
    composeLoose(params: { key: TKey; first: TDownOperation; second: TDownOperation }): CustomResult<TDownOperation | undefined, string | TCustomError>;

    // Ensure these:
    // - applyUp(prevState, twoWayOperation) = nextState
    // - applyDown(nextState, twoWayOperation) = prevState
    restore(params: { key: TKey; nextState: TServerState; downOperation: TDownOperation }): CustomResult<{ prevState: TServerState; twoWayOperation: TTwoWayOperation | undefined }, string | TCustomError>;

    // Ensure these:
    // - applyUp(prevState, twoWayOperation) = currentState
    // - applyDown(currentState, twoWayOperation) = prevState
    // - isPrivate関連の値の保護
    transform(params: { key: TKey; prevState: TServerState; currentState: TServerState; serverOperation: TTwoWayOperation | undefined; clientOperation: TUpOperation }): CustomResult<TTwoWayOperation | undefined, string | TCustomError>;

    // stateなどなしでcomposeLooseを定義しているが、その代償としてdiffの戻り値はDownでなくTwoWayである必要がある。
    diff(params: { key: TKey; prevState: TServerState; nextState: TServerState }): TTwoWayOperation | undefined;

    applyBack(params: { key: TKey; downOperation: TDownOperation; nextState: TServerState }): CustomResult<TServerState, string | TCustomError>;

    toServerState(params: { key: TKey; clientState: TClientState }): TServerState;

    protectedValuePolicy: ProtectedValuePolicy<TKey, TServerState>;
}

// 各メソッドはTransformerFactoryと同様の規則を満たす必要がある。
export type ParamRecordTransformerFactory<TKey, TServerState, TClientState, TDownOperation, TUpOperation, TTwoWayOperation, TError = string> = {
    composeLoose(params: { first: TDownOperation; second: TDownOperation }): CustomResult<TDownOperation | undefined, TError>;

    restore(params: { key: TKey; nextState: TServerState; downOperation: TDownOperation }): CustomResult<{ prevState: TServerState; twoWayOperation: TTwoWayOperation | undefined }, TError>;

    transform(params: { key: TKey; prevState: TServerState; currentState: TServerState; serverOperation: TTwoWayOperation | undefined; clientOperation: TUpOperation }): CustomResult<TTwoWayOperation | undefined, TError>;

    diff(params: { key: TKey; prevState: TServerState; nextState: TServerState }): TTwoWayOperation | undefined;

    applyBack(params: { key: TKey; downOperation: TDownOperation; nextState: TServerState }): CustomResult<TServerState, TError>;

    toServerState(params: { key: TKey; clientState: TClientState }): TServerState;

    createDefaultState: (params: { key: TKey }) => TServerState;
}