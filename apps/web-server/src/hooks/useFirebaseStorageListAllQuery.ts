import { FirebaseStorage, ListResult, StorageReference, ref } from '@firebase/storage';
import { FirebaseError } from '@firebase/util';
import { QueryKey, useQuery } from '@tanstack/react-query';
import { listAll } from 'firebase/storage';
import { useAtomValue } from 'jotai';
import React from 'react';
import { useMyUserUid } from './useMyUserUid';
import { useWebConfig } from './useWebConfig';
import { firebaseStorageAtom } from '@/pages/_app';
import { Path } from '@/utils/file/firebaseStorage';

/** 再帰的に Firebase Storage の listAll 関数を実行します。
 * @param storageRef listAll 関数を再帰的に実行する対象。
 * @param next 新しい ListResult が見つかるたびに実行される関数。
 */
const listAllRecursive = async (
    storageRef: StorageReference,
    next: (listResult: ListResult) => void,
): Promise<void> => {
    const list = await listAll(storageRef);
    next(list);
    for (const prefix of list.prefixes) {
        await listAllRecursive(prefix, next);
    }
};

export type File = {
    storageReference: StorageReference;
    uploaderFilePath: string;
};

const ofPublicUploaderFile = (source: StorageReference): File => {
    return {
        storageReference: source,
        uploaderFilePath: source.fullPath.replace(Path.public.list.string + '/', ''),
    };
};

const ofUnlistedUploaderFile =
    (userUid: string) =>
    (source: StorageReference): File => {
        return {
            storageReference: source,
            uploaderFilePath: source.fullPath.replace(Path.unlisted.list(userUid).string + '/', ''),
        };
    };

export const success = 'success';
export const fetching = 'fetching';
export const appError = 'appError';
export const fetchError = 'fetchError';
export const storageIsNullish = 'storageIsNullish';
export const myUserUidIsNullish = 'myUserUidIsNullish';
export const disabledByConfig = 'disabledByConfig';

const queryKeyRoot = 'useFirebaseStorageListAllQuery@2f01ed80-361e-47fc-bda1-6877999c4372';

const queryKey = ({
    storage,
    myUserUid,
    isPublicFirebaseStorageEnabled,
    isUnlistedFirebaseStorageEnabled,
}: {
    storage: FirebaseStorage | null | undefined;
    myUserUid: string | null | undefined;
    isPublicFirebaseStorageEnabled?: boolean;
    isUnlistedFirebaseStorageEnabled?: boolean;
}): QueryKey => {
    if (storage == null) {
        return [queryKeyRoot, 'abort', storageIsNullish];
    }
    if (myUserUid == null) {
        return [queryKeyRoot, 'abort', myUserUidIsNullish];
    }
    return [
        queryKeyRoot,
        'fetch',
        { myUserUid, isPublicFirebaseStorageEnabled, isUnlistedFirebaseStorageEnabled },
    ];
};

type FetchResultSourceData =
    | {
          type: typeof success;
          value: File[];
      }
    | {
          type: typeof appError;
          error: typeof storageIsNullish | typeof myUserUidIsNullish | typeof disabledByConfig;
      }
    | undefined;

export type FetchResult<T> =
    | {
          type: typeof success;
          value: T;
      }
    | {
          type: typeof fetching;
      }
    | {
          type: typeof appError;
          error: typeof storageIsNullish | typeof myUserUidIsNullish | typeof disabledByConfig;
      }
    | {
          type: typeof fetchError;
          error: FirebaseError;
      };

const toFetchResult = (
    data: FetchResultSourceData,
    error: FirebaseError | null | undefined,
): FetchResult<File[]> => {
    if (error != null) {
        return { type: fetchError, error };
    }
    if (data == null) {
        return { type: fetching };
    }
    return data;
};

export const mapFetchResult = <T1, T2>(
    source: FetchResult<T1>,
    mapping: (x: T1) => T2,
): FetchResult<T2> => {
    if (source.type === success) {
        return { type: success, value: mapping(source.value) };
    }
    return source;
};

export const useFirebaseStorageListAllQuery = () => {
    const storage = useAtomValue(firebaseStorageAtom);
    const myUserUid = useMyUserUid();
    const webConfig = useWebConfig();
    const isPublicFirebaseStorageEnabled =
        webConfig?.value?.isPublicFirebaseStorageEnabled === true;
    const isUnlistedFirebaseStorageEnabled =
        webConfig?.value?.isUnlistedFirebaseStorageEnabled === true;

    const publicFiles = useQuery({
        queryKey: queryKey({
            storage,
            myUserUid,
            isPublicFirebaseStorageEnabled,
        }),
        queryFn: async () => {
            if (storage == null) {
                return { type: appError, error: storageIsNullish } as const;
            }
            if (myUserUid == null) {
                return { type: appError, error: myUserUidIsNullish } as const;
            }
            if (!isPublicFirebaseStorageEnabled) {
                return { type: appError, error: disabledByConfig } as const;
            }

            const result: File[] = [];
            const storageRef = ref(storage, Path.public.list.string);
            await listAllRecursive(storageRef, listResult => {
                for (const item of listResult.items) {
                    result.push(ofPublicUploaderFile(item));
                }
            });
            return { type: success, value: result } as const;
        },
    });

    const unlistedFiles = useQuery({
        queryKey: queryKey({
            storage,
            myUserUid,
            isUnlistedFirebaseStorageEnabled,
        }),
        queryFn: async () => {
            if (storage == null) {
                return { type: appError, error: storageIsNullish } as const;
            }
            if (myUserUid == null) {
                return { type: appError, error: myUserUidIsNullish } as const;
            }
            if (!isUnlistedFirebaseStorageEnabled) {
                return { type: appError, error: disabledByConfig } as const;
            }

            const result: File[] = [];
            const storageRef = ref(storage, Path.unlisted.list(myUserUid).string);
            await listAllRecursive(storageRef, listResult => {
                for (const item of listResult.items) {
                    result.push(ofUnlistedUploaderFile(myUserUid)(item));
                }
            });
            return { type: success, value: result } as const;
        },
    });

    return React.useMemo(() => {
        const refetchPublicFiles = publicFiles.refetch;
        const refetchUnlistedFiles = unlistedFiles.refetch;
        return {
            public: toFetchResult(
                publicFiles.data,
                publicFiles.error as FirebaseError | null | undefined,
            ),
            unlisted: toFetchResult(
                unlistedFiles.data,
                unlistedFiles.error as FirebaseError | null | undefined,
            ),

            refetch: async () => {
                await refetchPublicFiles();
                await refetchUnlistedFiles();
            },
        } as const;
    }, [
        publicFiles.data,
        publicFiles.error,
        unlistedFiles.data,
        unlistedFiles.error,
        publicFiles.refetch,
        unlistedFiles.refetch,
    ]);
};
