import { CompositeKey } from '@flocon-trpg/utils';
import { atom } from 'jotai';

export type CommandEditorModalType = {
    characterKey: CompositeKey;
};

export const commandEditorModalAtom = atom<CommandEditorModalType | null>(null);
