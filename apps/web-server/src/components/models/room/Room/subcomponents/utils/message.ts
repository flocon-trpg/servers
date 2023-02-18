import { RoomPrivateMessage, RoomPublicMessage } from '@flocon-trpg/typed-document-node-v0.7.13';

export const isDeleted = (
    message: Omit<RoomPublicMessage | RoomPrivateMessage, 'createdAt'>
): boolean => {
    if (message.updatedText == null) {
        return false;
    }
    return message.updatedText.currentText == null;
};

export const toText = (
    message: Omit<RoomPublicMessage | RoomPrivateMessage, 'createdAt'>
): string | null => {
    if (isDeleted(message)) {
        return null;
    }
    return message.updatedText?.currentText ?? message.initText ?? null;
};
