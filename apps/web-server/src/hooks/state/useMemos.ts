import React from 'react';
import { recordToMap } from '@flocon-trpg/utils';
import { MemoState } from '@flocon-trpg/core';
import { useAtomSelector } from '../../atoms/useAtomSelector';
import { roomAtom } from '../../atoms/room/roomAtom';

export const useMemos = (): ReadonlyMap<string, MemoState> | undefined => {
    const memos = useAtomSelector(roomAtom, state => state.roomState?.state?.memos);
    return React.useMemo(() => (memos == null ? undefined : recordToMap(memos)), [memos]);
};
