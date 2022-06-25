import { atom } from 'jotai';
import { FileState } from '../fileState';

export const publicFilesAtom = atom<ReadonlyArray<FileState>>([]);
