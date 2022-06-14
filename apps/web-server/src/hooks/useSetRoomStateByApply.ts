import { UpOperation, roomTemplate } from '@flocon-trpg/core';
import { roomAtom } from '../atoms/roomAtom/roomAtom';
import { useAtomSelector } from './useAtomSelector';

const emptyOperate = (operation: UpOperation<typeof roomTemplate>): void => {
    throw new Error('useOperate is not ready');
};

// useOperateAsStateとimmerを組み合わせたほうが使いやすいと思われる。パフォーマンスもほぼ変わらないと考えられる。useOperateは互換性のために残している
export const useSetRoomStateByApply = () => {
    return useAtomSelector(roomAtom, state => state.roomState?.setStateByApply) ?? emptyOperate;
};
