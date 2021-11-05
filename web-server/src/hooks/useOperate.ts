import { UpOperation } from '@kizahasi/flocon-core';
import { useSelector } from '../store';

const emptyOperate = (operation: UpOperation): void => {
    throw new Error('useOperate is not ready');
};

// useOperateAsStateとimmerを組み合わせたほうが使いやすいと思われる。パフォーマンスもほぼ変わらないと考えられる。useOperateは互換性のために残している
export const useOperate = () => {
    return useSelector(state => state.roomModule.roomState?.operate) ?? emptyOperate;
};
