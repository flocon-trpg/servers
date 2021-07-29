import { FileSourceType } from '../generated/graphql';
import * as Core from '@kizahasi/flocon-core';
import { getStorageForce } from './firebaseHelpers';
import { Config } from '../config';
import { ExpiryMap } from './expiryMap';

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

    export const getUrl = async (
        path: FilePath | Omit<Core.FilePath, '$version'>,
        config: Config,
        cache: ExpiryMap<string, string> | null
    ): Promise<string | null> => {
        if (path.sourceType === FileSourceType.Default) {
            return path.path;
        }
        const cachedUrl = cache?.get(path.path);
        if (cachedUrl != null) {
            return cachedUrl;
        }
        const url = await getStorageForce(config)
            .ref(path.path)
            .getDownloadURL()
            .catch(() => null);
        if (typeof url !== 'string') {
            return null;
        }
        cache?.set(path.path, url, 1000 * 60 * 10);
        return url;
    };
}
