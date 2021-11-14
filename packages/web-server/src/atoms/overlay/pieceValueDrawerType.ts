import { PieceState } from '@flocon-trpg/core';
import { CompositeKey } from '@flocon-trpg/utils';
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
          characterKey: CompositeKey;
          // boardKey != nullならば、pieceが指定されたupdate。そうでないならばpieceが指定されないupdate。
          boardKey: CompositeKey | null;
          stateKey: string;
      };
