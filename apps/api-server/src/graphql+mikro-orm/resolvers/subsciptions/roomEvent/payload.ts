import { WritingMessageStatusType } from '../../../../enums/WritingMessageStatusType';
import { RoomOperation } from '../../../entities/room/graphql';
import { RoomMessageEvent } from '../../../entities/roomMessage/graphql';
import { SendTo } from '../../types';

export type MessageUpdatePayload = {
    type: 'messageUpdatePayload';

    roomId: string;

    // RoomPublicMessageなどのcreatedByと等しい。RoomPublicChannelの場合はnullish。
    // Update系においてcreatedByが必要だが、RoomMessageEventに含まれていないためここで定義している。
    createdBy: string | undefined;

    // RoomPrivateMessageUpdateのときにvisibleToが必要だが、RoomPrivateMessageUpdateに含まれていないためここで定義している。
    // visibleToが存在しない場合はnullish。
    visibleTo: string[] | undefined;

    value: typeof RoomMessageEvent;
};

export type RoomOperationPayload = {
    type: 'roomOperationPayload';
    roomId: string;
    generateOperation: (deliverTo: string) => RoomOperation;
};

type DeleteRoomPayload = {
    type: 'deleteRoomPayload';
    roomId: string;
    deletedBy: string;
    deletedByAdmin: boolean;
};

export type RoomConnectionUpdatePayload = {
    type: 'roomConnectionUpdatePayload';
    roomId: string;
    userUid: string;
    isConnected: boolean;
    updatedAt: number;
};

export type WritingMessageStatusUpdatePayload = {
    type: 'writingMessageStatusUpdatePayload';
    roomId: string;
    userUid: string;
    status: WritingMessageStatusType;
    updatedAt: number;
};

export type RoomMessagesResetPayload = {
    type: 'roomMessagesResetPayload';
    roomId: string;
};

export type RoomEventPayload = (
    | MessageUpdatePayload
    | RoomOperationPayload
    | DeleteRoomPayload
    | RoomConnectionUpdatePayload
    | WritingMessageStatusUpdatePayload
    | RoomMessagesResetPayload
) &
    SendTo;
