import { atom } from 'jotai';
import { PieceValueDrawerType } from './pieceValueDrawerType';

export const stringPieceDrawerAtom = atom<PieceValueDrawerType | null>(null);
