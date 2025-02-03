import { RoomPrivateMessageFragmentDoc } from '@flocon-trpg/graphql-documents';
import { RoomPublicMessageFragmentDoc } from '@flocon-trpg/graphql-documents/dist/cjs/graphql-codegen/graphql';
import { ResultOf } from '@graphql-typed-document-node/core';

type RoomPublicMessage = ResultOf<typeof RoomPublicMessageFragmentDoc>;
type RoomPrivateMessage = ResultOf<typeof RoomPrivateMessageFragmentDoc>;

export const isDeleted = (
    message: Omit<RoomPublicMessage | RoomPrivateMessage, 'createdAt'>,
): boolean => {
    if (message.updatedText == null) {
        return false;
    }
    return message.updatedText.currentText == null;
};

export const toText = (
    message: Omit<RoomPublicMessage | RoomPrivateMessage, 'createdAt'>,
): string | null => {
    if (isDeleted(message)) {
        return null;
    }
    return message.updatedText?.currentText ?? message.initText ?? null;
};
