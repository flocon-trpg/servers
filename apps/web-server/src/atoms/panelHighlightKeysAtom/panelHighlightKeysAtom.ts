import { atom } from 'jotai';

// rollCallPanel 以外のpanelは、現時点では強調表示する機会がないため対応していない。
type Type = {
    rollCallPanel?: string | undefined;
};

export const panelHighlightKeysAtom = atom<Type>({});
