import { atom } from 'jotai';
import { PieceValueEditorType } from '../../utils/pieceValueEditorType';

export const stringPieceDrawerAtom = atom<PieceValueEditorType | null>(null);
