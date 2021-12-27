import { FileType } from '../../utils/fileType';
import { StorageReference } from 'firebase/storage';

export type Reference = StorageReference;

export type FileState = {
    reference: Reference;
    fullPath: string;
    fileName: string;
    fileType: FileType;
    metadata: unknown;
};
