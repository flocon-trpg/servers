import { PrimitiveAtom, atom } from 'jotai';
import { create, update } from '../../utils/constants';
import { PiecePositionWithCell } from '../../utils/types';

type PieceValueEditorState =
    | {
          type: typeof create;
          boardId: string;
          piecePosition: PiecePositionWithCell;
      }
    | {
          type: typeof update;
          boardId: string;
          pieceId: string;

          // BufferedInputの変更内容が保存されていない状態でModalを閉じてもその変更が反映されるように、updateモードのModalが閉じられたときはPieceValueEditorStateをnullにするのではなくclosedをfalseに切り替えるようにしている。
          closed: boolean;
      }
    | null;

type PieceValueEditorAction =
    | {
          type: typeof create;
          boardId: string;
          piecePosition: PiecePositionWithCell;
      }
    | {
          type: typeof update;
          boardId: string;
          pieceId: string;
      }
    | null;

const createAtom = (sourceAtom: PrimitiveAtom<PieceValueEditorState>) => {
    return atom<PieceValueEditorState, PieceValueEditorAction>(
        get => get(sourceAtom),
        (get, set, newValue) => {
            switch (newValue?.type) {
                case create:
                    set(sourceAtom, newValue);
                    break;
                case update:
                    set(sourceAtom, {
                        ...newValue,
                        closed: false,
                    });
                    break;
                case undefined: {
                    const prevValue = get(sourceAtom);
                    if (prevValue?.type === update) {
                        set(sourceAtom, { ...prevValue, closed: true });
                        return;
                    }
                    set(sourceAtom, newValue);
                }
            }
        }
    );
};

const dicePieceValueEditorPrimitiveAtom = atom<PieceValueEditorState>(null);
export const dicePieceValueEditorAtom = createAtom(dicePieceValueEditorPrimitiveAtom);

const stringPieceValueEditorPrimitiveAtom = atom<PieceValueEditorState>(null);
export const stringPieceValueEditorAtom = createAtom(stringPieceValueEditorPrimitiveAtom);
