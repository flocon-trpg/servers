import { State, UpOperation, apply, roomTemplate, toOtError } from '@flocon-trpg/core';
import {
    WritingMessageStatusInputType,
    WritingMessageStatusType,
} from '@flocon-trpg/graphql-documents';
import { RoomMessagesClient } from '@flocon-trpg/web-server-utils';
import { RoomClient } from './createRoomClient';
import { GraphQLStatusEventEmitter } from './roomClient/graphqlClient';
import { RoomConnectionsManager } from './roomClient/roomConnections';
import { GetMessagesQueryStatus } from './roomClient/roomMessages';
import { RoomState, SetAction } from './roomClient/roomState';
import { BehaviorEvent } from './rxjs/behaviorEvent';
import { ReadonlyBehaviorEvent } from './rxjs/readonlyBehaviorEvent';

type JoinedRoomState = State<typeof roomTemplate>;
type JoinedRoomStateUpOperation = UpOperation<typeof roomTemplate>;
const applyJoinedRoomState = apply(roomTemplate);

const createTestRoomClientSource = <TCustomMessage, TGraphQLError>() => {
    const roomMessageClient = new RoomMessagesClient<TCustomMessage>();
    const queryStatus = new BehaviorEvent<GetMessagesQueryStatus<TGraphQLError>>({
        type: 'fetching',
    });
    const roomState = new BehaviorEvent<RoomState<TGraphQLError>>({ type: 'fetching' });
    const graphQLStatus = new GraphQLStatusEventEmitter<TGraphQLError>();
    const roomConnections = new RoomConnectionsManager();
    const writingMessageStatusValue = new BehaviorEvent<
        ReadonlyMap<string, WritingMessageStatusType>
    >(new Map());

    return {
        roomMessageClient,
        queryStatus,
        roomState,
        clientStatus: graphQLStatus,
        roomConnections,
        writingMessageStatusValue,
    };
};

type MockSource<TCustomMessage, TGraphQLError> = ReturnType<
    typeof createTestRoomClientSource<TCustomMessage, TGraphQLError>
>;

export const createTestRoomClient = <TCustomMessage, TGraphQLError>(callback: {
    writingMessageStatus?: (
        inputType: WritingMessageStatusInputType,
        source: MockSource<TCustomMessage, TGraphQLError>,
    ) => void;
    unsubscribe?: (source: MockSource<TCustomMessage, TGraphQLError>) => void;
}) => {
    const source = createTestRoomClientSource<TCustomMessage, TGraphQLError>();

    const roomClient: RoomClient<TCustomMessage, TGraphQLError> = {
        messages: {
            messages: source.roomMessageClient.messages,
            addCustomMessage: notification =>
                source.roomMessageClient.addCustomMessage(notification),
            queryStatus: new ReadonlyBehaviorEvent(source.queryStatus),
        },
        roomConnections: source.roomConnections.toReadonlyBehaviorEvent(),
        roomState: new ReadonlyBehaviorEvent(source.roomState),
        writingMessageStatus: {
            value: new ReadonlyBehaviorEvent(source.writingMessageStatusValue),
            update: inputType =>
                callback.writingMessageStatus && callback.writingMessageStatus(inputType, source),
        },
        graphQLStatus: source.clientStatus.toReadonlyBehaviorEvent(),
        unsubscribe: () => callback.unsubscribe && callback.unsubscribe(source),
    };

    type RoomStateForTestRoomClient =
        | Exclude<RoomState<TGraphQLError>, { type: 'joined' }>
        | {
              type: 'joined';
              state: JoinedRoomState;
          };

    return {
        roomClient,
        source: {
            ...source,
            roomState: {
                next(newState: RoomStateForTestRoomClient) {
                    if (newState.type !== 'joined') {
                        source.roomState.next(newState);
                        return;
                    }
                    let currentState = newState.state;
                    function next() {
                        source.roomState.next({
                            type: 'joined',
                            state: currentState,
                            setState,
                            setStateByApply,
                        });
                    }
                    function setState(action: SetAction<JoinedRoomState>) {
                        currentState = typeof action === 'function' ? action(currentState) : action;
                        next();
                    }
                    function setStateByApply(operation: JoinedRoomStateUpOperation) {
                        const r = applyJoinedRoomState({ state: currentState, operation });
                        if (r.isError) {
                            throw toOtError(r.error);
                        }
                        currentState = r.value;
                        next();
                    }
                    next();
                },
            },
            clientStatus: {
                next: (update: Parameters<typeof source.clientStatus.next>[0]) =>
                    source.clientStatus.next(update),
            },
        },
    };
};
