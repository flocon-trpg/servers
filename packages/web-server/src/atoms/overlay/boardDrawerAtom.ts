import { CompositeKey } from '@flocon-trpg/utils';
import { atom } from 'jotai';
import { create, update } from '../../utils/constants';

export type BoardEditorDrawerType =
    | {
          type: typeof create;

          // ボードを作成した際に、自動的にそのボードをアクティブにするために使われる。
          // 現時点ではこれがnullになることはないが、ボードエディターからこのDrawerを開くときはboardEditorPanelIdが指定できないためそれを想定してnullを型に加えている。
          boardEditorPanelId: string | null;
      }
    | {
          type: typeof update;
          stateKey: CompositeKey;
      };

export const boardEditorDrawerAtom = atom<BoardEditorDrawerType | null>(null);
