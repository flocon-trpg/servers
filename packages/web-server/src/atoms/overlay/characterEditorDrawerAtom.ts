import { atom } from 'jotai';
import { create, update } from '../../utils/constants';

export type CharacterEditorDrawerType =
    | {
          type: typeof create;
      }
    | {
          type: typeof update;
          stateId: string;
          // non-nullishならばPieceの編集UIも表示される。
          // Pieceの編集はcreateとupdate兼用。どちらの場合でもboardKeyとcharacterKeyの値は最初から決まっている。
          boardId?: string;
      };

export const characterEditorDrawerAtom = atom<CharacterEditorDrawerType | null>(null);
