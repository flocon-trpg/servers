import * as Core from '@flocon-trpg/core';
import { FilePathInput, FileSourceType } from '@flocon-trpg/graphql-documents';
import { ResultOf } from '@graphql-typed-document-node/core';
import { FirebaseStorage, getDownloadURL, ref } from 'firebase/storage';
import { MockableWebConfig } from '../../configType';
import { FilePathFragmentDoc } from '../../graphql/FilePathFragmentDoc';
import {
    files,
    getFloconUploaderFile as getFloconUploaderFileCore,
    idTokenIsNull,
    thumbs,
} from './getFloconUploaderFile';

type FilePathState = Core.State<typeof Core.filePathTemplate>;
type FilePathFragment = ResultOf<typeof FilePathFragmentDoc>;

export const filePath = 'filePath';

export type FilePath = {
    path: string;
    sourceType: FileSourceType;
};

export type FilePathLike =
    | Core.OmitVersion<FilePathState>
    | FilePathFragment
    | FilePathInput
    | FilePath;

export type FilePathLikeOrThumb =
    | (FilePathLike & { type?: undefined })
    | {
          // 内蔵アップローダーのサムネイル

          type: typeof thumbs;
          thumbFilename: string;
      };

export namespace FilePathModule {
    export const equals = (
        x: FilePathLike | null | undefined,
        y: FilePathLike | null | undefined,
    ): boolean => {
        if (x == null) {
            return y == null;
        }
        if (y == null) {
            return false;
        }
        return x.path === y.path && x.sourceType === y.sourceType;
    };

    export const ensureType = (source: FilePathLikeOrThumb) => {
        if ('type' in source) {
            if (source.type === 'thumbs') {
                return source;
            }
        }

        return {
            type: filePath,
            value: source satisfies FilePathLike,
        } as const;
    };

    export const toGraphQL = (source: FilePathLike): FilePath => {
        let sourceType: FileSourceType;
        switch (source.sourceType) {
            case Core.Default:
                sourceType = FileSourceType.Default;
                break;
            case Core.FirebaseStorage:
                sourceType = FileSourceType.FirebaseStorage;
                break;
            case Core.Uploader:
                sourceType = FileSourceType.Uploader;
                break;
        }
        return {
            path: source.path,
            sourceType,
        };
    };

    export const toOtState = (source: FilePathLike): FilePathState => {
        let sourceType: typeof Core.Default | typeof Core.FirebaseStorage | typeof Core.Uploader;
        switch (source.sourceType) {
            case FileSourceType.Default:
                sourceType = Core.Default;
                break;
            case FileSourceType.FirebaseStorage:
                sourceType = Core.FirebaseStorage;
                break;
            case FileSourceType.Uploader:
                sourceType = Core.Uploader;
                break;
        }
        return {
            $v: 1,
            $r: 1,
            path: source.path,
            sourceType,
        };
    };

    export type SrcResult =
        | {
              type: typeof Core.Default | typeof Core.FirebaseStorage;
              src: string;
              blob: undefined;
          }
        | {
              type: typeof Core.Uploader;
              isThumb: boolean;
              src: string;
              blob: Blob;
              filename: string;
          }
        | {
              type: typeof Core.FirebaseStorage | typeof Core.Uploader;
              src: undefined;
              blob: undefined;
          };

    export const getSrc = async ({
        path,
        config,
        storage,
        getIdToken,
        autoRedirect,
    }: {
        path: FilePathLikeOrThumb;
        config: MockableWebConfig;
        storage: FirebaseStorage;
        getIdToken: () => Promise<string | null>;
        autoRedirect?: boolean;
    }): Promise<SrcResult | typeof idTokenIsNull> => {
        const getFloconUploaderFile = async ({
            filename,
            floconUploaderMode,
        }: {
            filename: string;
            floconUploaderMode: typeof files | typeof thumbs;
        }) => {
            const blob = await getFloconUploaderFileCore({
                filename,
                config,
                getIdToken,
                mode: floconUploaderMode,
            });
            if (blob === idTokenIsNull) {
                return idTokenIsNull;
            }
            if (blob == null) {
                return {
                    type: Core.Uploader,
                    src: undefined,
                    blob: undefined,
                } as const;
            }
            // 現在の仕様では、内蔵アップローダーのダウンロードにはAuthorizationヘッダーが必要なため、axiosなどでなければダウンロードできない。そのため、URL.createObjectURLを経由して渡している。
            return {
                type: Core.Uploader,
                isThumb: floconUploaderMode === thumbs,
                src: URL.createObjectURL(blob),
                blob,
                filename,
            } as const;
        };

        const $path = ensureType(path);

        if ($path.type === 'thumbs') {
            return await getFloconUploaderFile({
                filename: $path.thumbFilename,
                floconUploaderMode: thumbs,
            });
        }

        switch ($path.value.sourceType) {
            case FileSourceType.Uploader: {
                return await getFloconUploaderFile({
                    filename: $path.value.path,
                    floconUploaderMode: files,
                });
            }
            case FileSourceType.FirebaseStorage: {
                const storageRef = ref(storage, $path.value.path);
                const url = await getDownloadURL(storageRef).catch(() => null);
                if (typeof url !== 'string') {
                    return {
                        type: Core.FirebaseStorage,
                        src: undefined,
                        blob: undefined,
                    };
                }
                return {
                    type: Core.FirebaseStorage,
                    src: url,
                    blob: undefined,
                };
            }
            default: {
                if (autoRedirect === true) {
                    const redirected = await fetch($path.value.path);
                    if (redirected.ok) {
                        return {
                            type: Core.Default,
                            src: redirected.url,
                            blob: undefined,
                        };
                    }
                }
                return {
                    type: Core.Default,
                    src: $path.value.path,
                    blob: undefined,
                };
            }
        }
    };
}
