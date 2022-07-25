import { firebaseStorageAtom } from '@/pages/_app';
import { Path } from '@/utils/file/firebaseStorage';
import { FirebaseStorage, StorageReference, ref } from '@firebase/storage';
import { listAll } from 'firebase/storage';
import { useAtomValue } from 'jotai';
import React from 'react';
import { QueryKey, useQuery } from 'react-query';
import { useMyUserUid } from './useMyUserUid';
import { useWebConfig } from './useWebConfig';

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

export const fetching = 'fetching';
export const storageIsNullish = 'storageIsNullish';
export const myUserUidIsNullish = 'myUserUidIsNullish';

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

export const useFirebaseStorageListAllQuery = () => {
    const storage = useAtomValue(firebaseStorageAtom);
    const myUserUid = useMyUserUid();
    const webConfig = useWebConfig();
    const isPublicFirebaseStorageEnabled =
        webConfig?.value?.isPublicFirebaseStorageEnabled === true;
    const isUnlistedFirebaseStorageEnabled =
        webConfig?.value?.isUnlistedFirebaseStorageEnabled === true;

    const publicFiles = useQuery(
        queryKey({
            storage,
            myUserUid,
            isPublicFirebaseStorageEnabled,
        }),
        async () => {
            if (storage == null) {
                return storageIsNullish;
            }
            if (myUserUid == null) {
                return myUserUidIsNullish;
            }
            if (!isPublicFirebaseStorageEnabled) {
                return null;
            }

            const result: File[] = [];
            const storageRef = ref(storage, Path.public.list.string);
            const rootListResult = await listAll(storageRef);
            result.push(...rootListResult.items.map(ofPublicUploaderFile));
            for (const prefix of rootListResult.prefixes) {
                const prefixListResult = await listAll(prefix);
                result.push(...prefixListResult.items.map(ofPublicUploaderFile));
            }

            return result;
        }
    );

    const unlistedFiles = useQuery(
        queryKey({
            storage,
            myUserUid,
            isUnlistedFirebaseStorageEnabled,
        }),
        async () => {
            if (storage == null) {
                return storageIsNullish;
            }
            if (myUserUid == null) {
                return myUserUidIsNullish;
            }
            if (!isUnlistedFirebaseStorageEnabled) {
                return null;
            }

            const result: File[] = [];
            const storageRef = ref(storage, Path.unlisted.list(myUserUid).string);
            const rootListResult = await listAll(storageRef);
            result.push(...rootListResult.items.map(ofUnlistedUploaderFile(myUserUid)));
            for (const prefix of rootListResult.prefixes) {
                const prefixListResult = await listAll(prefix);
                result.push(...prefixListResult.items.map(ofUnlistedUploaderFile(myUserUid)));
            }
            return result;
        }
    );

    return React.useMemo(() => {
        const refetchPublicFiles = publicFiles.refetch;
        const refetchUnlistedFiles = unlistedFiles.refetch;
        return {
            /** publicがWebConfigで無効にされているときはnull。 */
            public: publicFiles.data,

            /** unlistedがWebConfigで無効にされているときはnull。 */
            unlisted: unlistedFiles.data,

            refetch: async () => {
                await refetchPublicFiles();
                await refetchUnlistedFiles();
            },
        } as const;
    }, [publicFiles.data, unlistedFiles.data, publicFiles.refetch, unlistedFiles.refetch]);
};
