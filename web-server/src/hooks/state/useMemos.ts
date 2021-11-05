import React from 'react';
import { useSelector } from '../../store';
import { recordToMap } from '@kizahasi/util';
import { MemoState } from '@kizahasi/flocon-core';

export const useMemos = (): ReadonlyMap<string, MemoState> | undefined => {
    const memos = useSelector(state => state.roomModule.roomState?.state?.memos);
    return React.useMemo(() => (memos == null ? undefined : recordToMap(memos)), [memos]);
};
