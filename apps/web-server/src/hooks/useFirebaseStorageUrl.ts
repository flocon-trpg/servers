import { StorageReference } from 'firebase/storage';
import { useAtomValue } from 'jotai';
import React from 'react';
import {
    reference as referenceType,
    string,
    toReference,
    useFirebaseStorageUrlQuery,
} from '@/hooks/useFirebaseStorageUrlQuery';
import { firebaseStorageAtom } from '@/pages/_app';

type Props = {
    reference: StorageReference | string;
};

export const useFirebaseStorageUrl = ({ reference }: Props) => {
    const storage = useAtomValue(firebaseStorageAtom);

    const referenceSource =
        typeof reference === 'string'
            ? ({ type: string, reference, storage } as const)
            : ({
                  type: referenceType,
                  reference,
              } as const);
    const $reference = toReference(referenceSource);

    const queryResult = useFirebaseStorageUrlQuery($reference);

    return React.useMemo(
        () => ({
            fullPath: $reference?.fullPath,
            queryResult,
        }),
        [$reference?.fullPath, queryResult],
    );
};
