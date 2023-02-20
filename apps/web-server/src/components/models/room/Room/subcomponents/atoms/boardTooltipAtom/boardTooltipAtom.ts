import { atom } from 'jotai/vanilla';
import { MouseOverOn } from '../../utils/types';

export type BoardTooltipState = { pageX: number; pageY: number; mouseOverOn: MouseOverOn };

export const boardTooltipAtom = atom<BoardTooltipState | null>(null);
