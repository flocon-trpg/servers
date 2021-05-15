import { FileSourceType } from '../generated/graphql';
import * as FilePathModule from '../@shared/ot/filePath/v1';

export type FilePath = {
    path: string;
    sourceType: FileSourceType;
}

export namespace FilePath {
    export const toGraphQL = (source: FilePath | FilePathModule.FilePath): FilePath => {
        let sourceType: FileSourceType;
        switch (source.sourceType) {
            case FilePathModule.Default:
                sourceType = FileSourceType.Default;
                break;
            case FilePathModule.FirebaseStorage:
                sourceType = FileSourceType.FirebaseStorage;
                break;
            default:
                sourceType = source.sourceType;
                break;
        }
        return {
            path: source.path,
            sourceType,
        };
    };

    export const toOt = (source: FilePath | FilePathModule.FilePath): FilePathModule.FilePath => {
        let sourceType: typeof FilePathModule.Default | typeof FilePathModule.FirebaseStorage;
        switch (source.sourceType) {
            case FileSourceType.Default:
                sourceType = FilePathModule.Default;
                break;
            case FileSourceType.FirebaseStorage:
                sourceType = FilePathModule.FirebaseStorage;
                break;
            default:
                sourceType = source.sourceType;
                break;
        }
        return {
            $version: 1,
            path: source.path,
            sourceType,
        };
    };
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

export const emptyPublicChannelNames: PublicChannelNames = {
    publicChannel1Name: '',
    publicChannel2Name: '',
    publicChannel3Name: '',
    publicChannel4Name: '',
    publicChannel5Name: '',
    publicChannel6Name: '',
    publicChannel7Name: '',
    publicChannel8Name: '',
    publicChannel9Name: '',
    publicChannel10Name: '',
};

export const reset = 'reset';

export type Reset = { type: typeof reset }