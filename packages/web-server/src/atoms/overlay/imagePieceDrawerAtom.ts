import { PieceState } from '@flocon-trpg/core';
import { CompositeKey } from '@flocon-trpg/utils';
import { atom } from 'jotai';
import { create, update } from '../../utils/constants';

export type ImagePieceDrawerType =
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

export const imagePieceDrawerAtom = atom<ImagePieceDrawerType | null>(null);
