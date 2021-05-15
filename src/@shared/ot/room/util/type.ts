import { CustomResult, Result } from '../../../Result';
import { ApplyError, ComposeAndTransformError, PositiveInt } from '../../../textOperation';

export type Apply<TState, TOperation> = (params: { state: TState; operation: TOperation }) => CustomResult<TState, string | ApplyError<PositiveInt> | ComposeAndTransformError>;

export type Compose<TOperation> = (params: { prev: TOperation; next: TOperation }) => Result<TOperation | undefined>;

export type Diff<TState, TOperation> = (params: { prevState: TState; nextState: TState }) => TOperation | undefined;

export type Restore<TState, TDownOperation, TTwoWayOperation> = (params: { nextState: TState; downOperation: TDownOperation }) => Result<{
    prevState: TState;
    twoWayOperation: TTwoWayOperation;
}>

export type Transform<TServerState, TTwoWayOperation, TUpOperation> = (params: { prevState: TServerState; currentState: TServerState; serverOperation: TTwoWayOperation | undefined; clientOperation: TUpOperation }) => Result<TTwoWayOperation | undefined>;

// Ensure this:
// - diff(prevState) = nextState
//
// 全てのStateはdiffでoperationを求めることができるため、必須ではない。ただ、TextOperationなどは少しコストが高いため、再度diffを求めるのを避けるために渡したほうがいいのと、diffをそのまま返せば済む場面も少なくないのでdiffを必須としている。
export type ToClientOperationParams<TState, TOperation> = {
    prevState: TState;
    nextState: TState;
    diff: TOperation;
}

export const client = 'client';
export const server = 'server';

export type RequestedBy = {
    type: typeof server;
} | {
    type: typeof client;
    userUid: string;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace RequestedBy {
    // CONSIDER: 現状ではcreatedByMeという名前は直感的でない。実際はその値の全部もしくは一部に対するisSecretなどを無視して自由に編集できる権限があるかどうかを示す。
    export const createdByMe = ({ requestedBy, userUid }: { requestedBy: RequestedBy; userUid: string }): boolean => {
        if (requestedBy.type === server) {
            return true;
        }
        return requestedBy.userUid === userUid;
    };
}