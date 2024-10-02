import { FirebaseStorage, StorageReference, getDownloadURL, ref } from '@firebase/storage';
import { QueryClient, useQuery } from '@tanstack/react-query';

export const reference = 'reference';
export const string = 'string';

type ReferenceSource =
    | {
          type: typeof reference;
          reference: StorageReference;
      }
    | {
          type: typeof string;
          reference: string;
          storage: FirebaseStorage | null | undefined;
      }
    | null
    | undefined;

export const toReference = (params: ReferenceSource): StorageReference | null => {
    if (params == null) {
        return null;
    }
    if (params.type === string) {
        if (params.storage == null) {
            return null;
        }
        return ref(params.storage, params.reference);
    }
    return params.reference;
};

const queryKey = (storage: StorageReference | null): string[] => {
    if (storage == null) {
        return ['firebaseStorage@notFound'];
    }
    return ['firebaseStorage@path', storage.fullPath];
};

const queryFn = async (storage: StorageReference | null) => {
    if (storage == null) {
        return null;
    }
    return await getDownloadURL(storage);
};

export const useFirebaseStorageUrlQuery = (storage: StorageReference | null) => {
    return useQuery(queryKey(storage), () => queryFn(storage), {
        // FirebaseのURLは自動的にexpireされるのでcacheTimeを指定している。
        // TODO: 1時間にしているがこの値は適当。
        cacheTime: 1000 * 60 * 60 * 1,
    });
};

export const fetchFirebaseStorageUrlQuery = (
    queryClient: QueryClient,
    storage: StorageReference | null,
) => {
    return queryClient.fetchQuery(queryKey(storage), () => queryFn(storage));
};
