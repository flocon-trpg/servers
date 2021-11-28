import { PieceState } from '@flocon-trpg/core';
import { create, update } from '../../utils/constants';

export type PieceValueDrawerType =
    | {
          // pieceとともに作成するケース
          type: typeof create;
          piece: PieceState;
      }
    | {
          // pieceは作成しないケース
          type: typeof create;
          piece: null;
      }
    | {
          type: typeof update;
          // boardKey != nullならば、pieceが指定されたupdate。そうでないならばpieceが指定されないupdate。
          boardId: string | null;
          stateId: string;
      };
