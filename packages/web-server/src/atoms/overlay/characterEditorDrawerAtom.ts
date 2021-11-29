import { atom } from 'jotai';
import { create, update } from '../../utils/constants';

export type CharacterEditorDrawerType =
    | {
          type: typeof create;
      }
    | {
          type: typeof update;
          stateId: string;
      };

export const characterEditorDrawerAtom = atom<CharacterEditorDrawerType | null>(null);
