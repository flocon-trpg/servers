import { ApplyError, PositiveInt, ComposeAndTransformError } from '@kizahasi/ot-string';
import { Result } from '@kizahasi/result';

type Error = string | ApplyError<PositiveInt> | ComposeAndTransformError;

export type Apply<TState, TOperation> = (params: {
    state: TState;
    operation: TOperation;
}) => Result<TState, Error>;

export type Compose<TOperation> = (params: {
    first: TOperation;
    second: TOperation;
}) => Result<TOperation | undefined, Error>;

export type Diff<TState, TOperation> = (params: {
    prevState: TState;
    nextState: TState;
}) => TOperation | undefined;

export type Restore<TState, TDownOperation, TTwoWayOperation> = (params: {
    nextState: TState;
    downOperation: TDownOperation;
}) => Result<
    {
        prevState: TState;
        twoWayOperation: TTwoWayOperation | undefined;
    },
    Error
>;

export type ServerTransform<TServerState, TTwoWayOperation, TUpOperation> = (params: {
    prevState: TServerState;
    currentState: TServerState;
    serverOperation: TTwoWayOperation | undefined;
    clientOperation: TUpOperation;
}) => Result<TTwoWayOperation | undefined, Error>;

export type ClientTransform<TOperation> = (params: {
    first: TOperation;
    second: TOperation;
}) => Result<{ firstPrime: TOperation | undefined; secondPrime: TOperation | undefined }, Error>;

// Ensure this:
// - diff(prevState) = nextState
//
// 全てのStateはdiffでoperationを求めることができるため、必須ではない。ただ、TextOperationなどは少しコストが高いため、再度diffを求めるのを避けるために渡したほうがいいのと、diffをそのまま返せば済む場面も少なくないのでdiffを必須としている。
export type ToClientOperationParams<TState, TOperation> = {
    prevState: TState;
    nextState: TState;
    diff: TOperation;
};

// 全てのStateに完全にアクセスできる。
export const admin = 'admin';

// userUidに基づき、一部のStateへのアクセスを制限する。
export const client = 'client';

// アクセス制限のあるStateを全て制限する。
export const restrict = 'restrict';

export type RequestedBy =
    | {
          type: typeof admin;
      }
    | {
          type: typeof client;
          userUid: string;
      }
    | {
          type: typeof restrict;
      };

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace RequestedBy {
    export const isAuthorized = ({
        requestedBy,
        userUid,
    }: {
        requestedBy: RequestedBy;
        userUid: string;
    }): boolean => {
        if (requestedBy.type === admin) {
            return true;
        }
        if (requestedBy.type === restrict) {
            return false;
        }
        return requestedBy.userUid === userUid;
    };
}
