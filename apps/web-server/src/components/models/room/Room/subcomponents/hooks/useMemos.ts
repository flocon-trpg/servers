import { State, memoTemplate } from '@flocon-trpg/core';
import { recordToMap } from '@flocon-trpg/utils';
import React from 'react';
import { roomAtom } from '@/atoms/roomAtom/roomAtom';
import { useAtomSelector } from '@/hooks/useAtomSelector';

type MemoState = State<typeof memoTemplate>;

export const useMemos = (): ReadonlyMap<string, MemoState> | undefined => {
    const memos = useAtomSelector(roomAtom, state => state.roomState?.state?.memos);
    return React.useMemo(() => (memos == null ? undefined : recordToMap(memos)), [memos]);
};
