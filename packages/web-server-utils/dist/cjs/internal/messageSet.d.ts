import { Message, RoomMessage } from './roomMessageTypes';
export declare class MessageSet<TCustomMessage> {
    #private;
    add(message: Message<TCustomMessage>): void;
    getPrivateMessage(messageId: string): import("@flocon-trpg/graphql-documents/dist/cjs/graphql-codegen/graphql").RoomPrivateMessageFragment | undefined;
    getPublicMessage(messageId: string): import("@flocon-trpg/graphql-documents/dist/cjs/graphql-codegen/graphql").RoomPublicMessageFragment | undefined;
    get(message: RoomMessage): RoomMessage | undefined;
    values(): Generator<Message<TCustomMessage>, any, any>;
}
//# sourceMappingURL=messageSet.d.ts.map