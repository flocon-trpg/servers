import { FileType } from '../../utils/fileType';

export type Reference = firebase.default.storage.Reference;

export type FileState = {
    reference: Reference;
    fullPath: string;
    fileName: string;
    fileType: FileType;
    metadata: unknown;
};
