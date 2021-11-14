import { atom } from 'jotai';
import { PieceValueDrawerType } from './pieceValueDrawerType';

export const dicePieceDrawerAtom = atom<PieceValueDrawerType | null>(null);
