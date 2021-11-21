import { FilePathFragment, FileSourceType } from '@flocon-trpg/typed-document-node';
import * as Core from '@flocon-trpg/core';
import { getStorageForce } from './firebaseHelpers';
import { ExpiryMap } from './expiryMap';
import { files, getFloconUploaderFile } from './getFloconUploaderFile';
import { WebConfig } from '../configType';

export type FilePath = {
    path: string;
    sourceType: FileSourceType;
};

export namespace FilePath {
    export const equals = (
        x: FilePathFragment | null | undefined,
        y: FilePathFragment | null | undefined
    ): boolean => {
        if (x == null) {
            return y == null;
        }
        if (y == null) {
            return false;
        }
        return x.path === y.path && x.sourceType === y.sourceType;
    };

    export const toGraphQL = (source: FilePath | Core.FilePath): FilePath => {
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
            default:
                sourceType = source.sourceType;
                break;
        }
        return {
            $v: 1,
            $r: 1,
            path: source.path,
            sourceType,
        };
    };

    type SrcResult =
        | {
              type: typeof Core.Default | typeof Core.FirebaseStorage;
              src: string;
              blob: undefined;
          }
        | {
              type: typeof Core.Uploader;
              src: string;
              blob: Blob;
          }
        | {
              type: typeof Core.FirebaseStorage | typeof Core.Uploader;
              src: undefined;
              blob: undefined;
          };

    export const getSrc = async (
        path: FilePath | Omit<Core.FilePath, '$v' | '$r'>,
        config: WebConfig,
        idToken: string,
        cache: ExpiryMap<string, string> | null
    ): Promise<SrcResult> => {
        switch (path.sourceType) {
            case FileSourceType.Uploader: {
                const axiosResponse = await getFloconUploaderFile({
                    filename: path.path,
                    config,
                    idToken,
                    mode: files,
                });
                if (axiosResponse.data == null) {
                    return {
                        type: Core.Uploader,
                        src: undefined,
                        blob: undefined,
                    };
                }
                const blob = new Blob([axiosResponse.data]);
                // 現在の仕様では、内蔵アップローダーのダウンロードにはAuthorizationヘッダーが必要なため、axiosなどでなければダウンロードできない。そのため、URL.createObjectURLを経由して渡している。
                return {
                    type: Core.Uploader,
                    src: URL.createObjectURL(blob),
                    blob,
                };
            }
            case FileSourceType.FirebaseStorage: {
                const cachedUrl = cache?.get(path.path);
                if (cachedUrl != null) {
                    return {
                        type: Core.FirebaseStorage,
                        src: cachedUrl,
                        blob: undefined,
                    };
                }
                const url = await getStorageForce(config)
                    .ref(path.path)
                    .getDownloadURL()
                    .catch(() => null);
                if (typeof url !== 'string') {
                    return {
                        type: Core.FirebaseStorage,
                        src: undefined,
                        blob: undefined,
                    };
                }
                cache?.set(path.path, url, 1000 * 60 * 10);
                return {
                    type: Core.FirebaseStorage,
                    src: url,
                    blob: undefined,
                };
            }
            default:
                return {
                    type: Core.Default,
                    src: path.path,
                    blob: undefined,
                };
        }
    };
}
