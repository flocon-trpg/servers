import { FirebaseStorage, StorageReference, getDownloadURL, ref } from '@firebase/storage';

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

export const queryKey = (storage: StorageReference | null): string[] => {
    if (storage == null) {
        return ['firebaseStorage@notFound'];
    }
    return ['firebaseStorage@path', storage.fullPath];
};

export const queryFunction = async (storage: StorageReference | null) => {
    if (storage == null) {
        throw new Error('FirebaseStorage instance not found.');
    }
    return await getDownloadURL(storage);
};
