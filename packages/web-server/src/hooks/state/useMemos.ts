import React from 'react';
import { useSelector } from '../../store';
import { recordToMap } from '@flocon-trpg/utils';
import { MemoState } from '@flocon-trpg/core';

export const useMemos = (): ReadonlyMap<string, MemoState> | undefined => {
    const memos = useSelector(state => state.roomModule.roomState?.state?.memos);
    return React.useMemo(() => (memos == null ? undefined : recordToMap(memos)), [memos]);
};
