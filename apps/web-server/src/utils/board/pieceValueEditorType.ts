import { create, update } from '../constants';
import { PiecePositionWithCell } from '../types';

export type PieceValueEditorType =
    | {
          type: typeof create;
          boardId: string;
          piecePosition: PiecePositionWithCell;
      }
    | {
          type: typeof update;
          boardId: string;
          pieceId: string;
      };
