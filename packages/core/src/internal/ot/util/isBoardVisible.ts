import { CompositeKey, compositeKeyEquals } from '@flocon-trpg/utils';
import { RequestedBy } from './type';

export const isBoardVisible = ({
    boardKey,
    activeBoardKey,
    requestedBy,
}: {
    boardKey: CompositeKey;
    activeBoardKey: CompositeKey | null | undefined;
    requestedBy: RequestedBy;
}) => {
    if (
        RequestedBy.isAuthorized({
            requestedBy,
            userUid: boardKey.createdBy,
        })
    ) {
        return true;
    }
    if (activeBoardKey == null) {
        return false;
    }
    return compositeKeyEquals(boardKey, activeBoardKey);
};
