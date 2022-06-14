import React from 'react';
import { recordToMap } from '@flocon-trpg/utils';
import { State, memoTemplate } from '@flocon-trpg/core';
import { useAtomSelector } from '../../../../../../hooks/useAtomSelector';
import { roomAtom } from '../../../../../../atoms/roomAtom/roomAtom';

type MemoState = State<typeof memoTemplate>;

export const useMemos = (): ReadonlyMap<string, MemoState> | undefined => {
    const memos = useAtomSelector(roomAtom, state => state.roomState?.state?.memos);
    return React.useMemo(() => (memos == null ? undefined : recordToMap(memos)), [memos]);
};
