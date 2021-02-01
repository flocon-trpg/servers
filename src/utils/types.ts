import { FileSourceType } from '../generated/graphql';

export type FilePath = {
    path: string;
    sourceType: FileSourceType;
}

export const none = 'none';
export const some = 'some';

export type FilesManagerDrawerType = {
    openFileType: typeof none;
} | {
    openFileType: typeof some;
    onOpen: (path: FilePath) => void;
}