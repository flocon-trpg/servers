import { atom } from 'jotai';
import { FileState } from './fileState';

export const unlistedFilesAtom = atom<ReadonlyArray<FileState>>([]);
