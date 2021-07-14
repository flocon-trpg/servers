import { FileSourceType } from '../generated/graphql';
import * as Core from '@kizahasi/flocon-core';
import { FilterValue } from 'antd/lib/table/interface';

export type FilePath = {
    path: string;
    sourceType: FileSourceType;
};

export namespace FilePath {
    export const toGraphQL = (source: FilePath | Core.FilePath): FilePath => {
        let sourceType: FileSourceType;
        switch (source.sourceType) {
            case Core.Default:
                sourceType = FileSourceType.Default;
                break;
            case Core.FirebaseStorage:
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

    export const toOt = (source: FilePath | Core.FilePath): Core.FilePath => {
        let sourceType: typeof Core.Default | typeof Core.FirebaseStorage;
        switch (source.sourceType) {
            case FileSourceType.Default:
                sourceType = Core.Default;
                break;
            case FileSourceType.FirebaseStorage:
                sourceType = Core.FirebaseStorage;
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

export type FilesManagerDrawerType =
    | {
          openFileType: typeof none;
          defaultFilteredValue?: FilterValue | undefined;
      }
    | {
          openFileType: typeof some;
          onOpen: (path: FilePath) => void;
          defaultFilteredValue: FilterValue | undefined;
      };

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
};

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

export type Reset = { type: typeof reset };
