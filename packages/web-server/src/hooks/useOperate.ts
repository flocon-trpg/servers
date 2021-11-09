import { UpOperation } from '@flocon-trpg/core';
import { roomAtom } from '../atoms/room/roomAtom';
import { useAtomSelector } from '../atoms/useAtomSelector';

const emptyOperate = (operation: UpOperation): void => {
    throw new Error('useOperate is not ready');
};

// useOperateAsStateとimmerを組み合わせたほうが使いやすいと思われる。パフォーマンスもほぼ変わらないと考えられる。useOperateは互換性のために残している
export const useOperate = () => {
    return useAtomSelector(roomAtom, state => state.roomState?.operate) ?? emptyOperate;
};
