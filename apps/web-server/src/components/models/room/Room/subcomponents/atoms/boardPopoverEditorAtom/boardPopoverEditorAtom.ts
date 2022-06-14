import { atom } from 'jotai';
import { ClickOn } from '../../utils/types';

export type BoardPopoverEditorState = { pageX: number; pageY: number; dblClickOn: ClickOn };

export const boardPopoverEditorAtom = atom<BoardPopoverEditorState | null>(null);
