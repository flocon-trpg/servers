import * as FilePathModule from '../@shared/ot/filePath/v1';

export enum FileSourceType {
    Default = 'Default',
    FirebaseStorage = 'FirebaseStorage'
}

export namespace FileSourceType {
    export const ofString = (source: typeof FilePathModule.Default | typeof FilePathModule.FirebaseStorage) => {
        switch (source) {
            case FilePathModule.Default:
                return FileSourceType.Default;
            case FilePathModule.FirebaseStorage:
                return FileSourceType.FirebaseStorage;
        }
    };

    export const ofNullishString = (source: typeof FilePathModule.Default | typeof FilePathModule.FirebaseStorage | null | undefined) => {
        switch (source) {
            case null:
            case undefined:
                return undefined;
            default:
                return ofString(source);
        }
    };
}