import { v4 } from 'uuid';

// 一意でありなおかつ時系列でソート可能なIDを生成する。
// (new Date().getTime())の値が同じ場合は時系列順にならないこともあるが、それは許容している。
export const easyFlake = () => {
    return `${new Date().getTime()}_${v4()}`;
};
