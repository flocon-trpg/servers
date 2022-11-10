import { State, memoTemplate } from '@flocon-trpg/core';
import { recordToMap } from '@flocon-trpg/utils';
import React from 'react';
import { useRoomStateValueSelector } from '@/hooks/useRoomStateValueSelector';

type MemoState = State<typeof memoTemplate>;

export const useMemos = (): ReadonlyMap<string, MemoState> | undefined => {
    const memos = useRoomStateValueSelector(state => state.memos);
    return React.useMemo(() => (memos == null ? undefined : recordToMap(memos)), [memos]);
};
