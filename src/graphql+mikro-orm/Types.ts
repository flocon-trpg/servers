export type RestoreResult<TState, TTwoWayOperation> = {
    prevState: TState;
    twoWayOperation: TTwoWayOperation;
};

export type TransformParameters<TServerState, TFirstOperation, TSecondOperation> = {
    first?: TFirstOperation;
    second: TSecondOperation;
    prevState: TServerState;
};

export type ProtectedTransformParameters<TServerState, TFirstOperation, TSecondOperation> = {
    first?: TFirstOperation;
    second: TSecondOperation;
    prevState: TServerState;
    nextState: TServerState;
};

export const client = 'client';
export const server = 'server';

export type RequestedBy =
    | {
          type: typeof server;
      }
    | {
          type: typeof client;
          userUid: string;
      };

export namespace RequestedBy {
    // CONSIDER: 現状ではcreatedByMeという名前は直感的でない。実際はその値の全部もしくは一部に対するisSecretなどを無視して自由に編集できる権限があるかどうかを示す。
    export const createdByMe = ({
        requestedBy,
        userUid,
    }: {
        requestedBy: RequestedBy;
        userUid: string;
    }): boolean => {
        if (requestedBy.type === server) {
            return true;
        }
        return requestedBy.userUid === userUid;
    };
}
