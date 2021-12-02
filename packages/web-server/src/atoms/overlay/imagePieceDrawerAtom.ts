import { atom } from 'jotai';
import { create, update } from '../../utils/constants';
import { PiecePositionWithoutCell } from '../../utils/types';

export type ImagePieceDrawerType =
    | {
          type: typeof create;
          boardId: string;
          piecePosition: PiecePositionWithoutCell;
      }
    | {
          type: typeof update;
          boardId: string;
          pieceId: string;
      };

export const imagePieceDrawerAtom = atom<ImagePieceDrawerType | null>(null);
