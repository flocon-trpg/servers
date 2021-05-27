import * as FilePathModule from '@kizahasi/flocon-core';

export enum FileSourceType {
    Default = 'Default',
    FirebaseStorage = 'FirebaseStorage'
}

// FileSourceTypeと同じ名前をつけると、npm run genしたときにenumにこれらの関数名も混じってしまうので別の名前を付けている。
export namespace FileSourceTypeModule {
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