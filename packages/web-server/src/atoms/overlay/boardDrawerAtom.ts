import { CompositeKey } from '@flocon-trpg/utils';
import { atom } from 'jotai';
import { create, update } from '../../utils/constants';

export type BoardEditorDrawerType =
    | {
          type: typeof create;
      }
    | {
          type: typeof update;
          stateKey: CompositeKey;
      };

export const boardEditorDrawerAtom = atom<BoardEditorDrawerType | null>(null);
