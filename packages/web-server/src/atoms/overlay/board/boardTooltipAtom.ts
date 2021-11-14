import { atom } from 'jotai';
import { MouseOverOn } from './types';

export type BoardTooltipState = { pageX: number; pageY: number; mouseOverOn: MouseOverOn };

export const boardTooltipAtom = atom<BoardTooltipState | null>(null);
