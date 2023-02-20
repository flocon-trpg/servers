import { RoomPrivateMessageFragment, RoomPublicMessageFragment } from '@flocon-trpg/typed-document-node';
import { Message, RoomMessage } from './roomMessageTypes';
export declare class MessageSet<TCustomMessage> {
    #private;
    add(message: Message<TCustomMessage>): void;
    getPrivateMessage(messageId: string): RoomPrivateMessageFragment | undefined;
    getPublicMessage(messageId: string): RoomPublicMessageFragment | undefined;
    get(message: RoomMessage): RoomMessage | undefined;
    values(): Generator<Message<TCustomMessage>, any, unknown>;
}
//# sourceMappingURL=messageSet.d.ts.map