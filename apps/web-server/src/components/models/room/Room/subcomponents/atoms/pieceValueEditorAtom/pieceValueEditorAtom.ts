import { atom } from 'jotai';
import { create, update } from '@/utils/constants';
import { PixelPosition } from '../../utils/positionAndSizeAndRect';

type PieceValueEditorState =
    | {
          type: typeof create;
          boardId: string;
          piecePosition: PixelPosition;
      }
    | {
          type: typeof update;
          boardId: string;
          pieceId: string;
      }
    | null;

export const dicePieceValueEditorAtom = atom<PieceValueEditorState>(null);

export const stringPieceValueEditorAtom = atom<PieceValueEditorState>(null);
