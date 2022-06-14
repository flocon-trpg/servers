import { atom } from 'jotai';

export type CommandEditorModalType = {
    characterId: string;
};

export const commandEditorModalAtom = atom<CommandEditorModalType | null>(null);
