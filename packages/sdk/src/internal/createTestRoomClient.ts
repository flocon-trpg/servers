import {
    WritingMessageStatusInputType,
    WritingMessageStatusType,
} from '@flocon-trpg/typed-document-node-v0.7.1';
import { RoomMessagesClient } from '@flocon-trpg/web-server-utils';
import { RoomClient } from './createRoomClient';
import { GraphQLStatusEventEmitter } from './roomClient/graphqlClient';
import { RoomConnectionsManager } from './roomClient/roomConnections';
import { GetMessagesQueryStatus } from './roomClient/roomMessages';
import { RoomState } from './roomClient/roomState';
import { BehaviorEvent } from './rxjs/behaviorEvent';
import { ReadonlyBehaviorEvent } from './rxjs/readonlyBehaviorEvent';

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
        source: MockSource<TCustomMessage, TGraphQLError>
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

    return {
        roomClient,
        source: {
            ...source,
            clientStatus: {
                next: (update: Parameters<typeof source.clientStatus.next>[0]) =>
                    source.clientStatus.next(update),
            },
        },
    };
};
