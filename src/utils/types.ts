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

export type PublicChannelNames = {
    publicChannel1Name: string;
    publicChannel2Name: string;
    publicChannel3Name: string;
    publicChannel4Name: string;
    publicChannel5Name: string;
    publicChannel6Name: string;
    publicChannel7Name: string;
    publicChannel8Name: string;
    publicChannel9Name: string;
    publicChannel10Name: string;
}