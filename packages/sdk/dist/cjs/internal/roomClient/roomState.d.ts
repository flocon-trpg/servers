import { State as S, UpOperation as U, roomTemplate } from '@flocon-trpg/core';
import { GetRoomFailureType, OperateRoomFailureType, RoomEventDoc } from '@flocon-trpg/graphql-documents';
import { ResultOf } from '@graphql-typed-document-node/core';
import { Observable } from 'rxjs';
import { ReadonlyBehaviorEvent } from '../rxjs/readonlyBehaviorEvent';
import { GraphQLClientWithStatus, PromiseError } from './graphqlClient';
type RoomEventSubscriptionResult = ResultOf<typeof RoomEventDoc>['result'];
declare const fetching = "fetching";
declare const joined = "joined";
declare const nonJoined = "nonJoined";
declare const GetRoomFailure = "GetRoomFailure";
declare const GraphQLError = "GraphQLError";
declare const transformationError = "transformationError";
declare const OperateRoomFailure = "OperateRoomFailure";
declare const deleted = "deleted";
type State = S<typeof roomTemplate>;
type UpOperation = U<typeof roomTemplate>;
declare const error = "error";
export type SetAction<State> = State | ((prevState: State) => State);
type NonJoinedRoom = {
    roomId: string;
    name: string;
    createdBy: string;
    requiresPlayerPassword: boolean;
    requiresSpectatorPassword: boolean;
};
export type RoomState<TGraphQLError> = {
    type: typeof fetching;
} | {
    type: typeof joined;
    state: State;
    setState: (setState: SetAction<State>) => void;
    setStateByApply: (operation: UpOperation) => void;
} | {
    type: typeof error;
    state: State;
    error: {
        type: typeof transformationError;
    } | {
        type: typeof OperateRoomFailure;
        error: OperateRoomFailureType;
    };
} | {
    type: typeof error;
    error: {
        type: typeof GetRoomFailure;
        error: GetRoomFailureType;
    } | {
        type: typeof GraphQLError;
        name: 'GetRoomQuery';
        error: PromiseError<TGraphQLError>;
    };
} | {
    type: typeof nonJoined;
    state: State | null;
    nonJoinedRoom: NonJoinedRoom;
} | {
    type: typeof deleted;
    deletedBy: string;
};
export declare class RoomStateManager<TGraphQLError> {
    #private;
    constructor({ client, subscription, userUid, clientId, }: {
        client: Pick<GraphQLClientWithStatus<TGraphQLError>, 'getRoomQuery' | 'operateMutation'>;
        subscription: Observable<Pick<NonNullable<RoomEventSubscriptionResult>, 'deleteRoomOperation' | 'roomOperation'>>;
        userUid: string;
        /** 同一ユーザーが複数のブラウザでアクセスしたなどの際に、それらを区別するための文字列です。 */
        clientId: string;
    });
    get stateStream(): ReadonlyBehaviorEvent<RoomState<TGraphQLError>>;
    get mutationError(): ReadonlyBehaviorEvent<PromiseError<TGraphQLError> | null>;
    get isUnsubscribed(): boolean;
    unsubscribe(): void;
}
export {};
//# sourceMappingURL=roomState.d.ts.map