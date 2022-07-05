import { firebaseStorageAtom } from '@/pages/_app';
import {
    queryFunction,
    queryKey,
    reference as referenceType,
    string,
    toReference,
} from '@/queries/firebaseUrlQuery';
import { StorageReference } from 'firebase/storage';
import { useAtomValue } from 'jotai';
import React from 'react';
import { useQuery } from 'react-query';

type Props = {
    reference: StorageReference | string;
};

export const useFirebaseUrl = ({ reference }: Props) => {
    const storage = useAtomValue(firebaseStorageAtom);

    const referenceSource =
        typeof reference === 'string'
            ? ({ type: string, reference, storage } as const)
            : ({
                  type: referenceType,
                  reference,
              } as const);

    const $reference = toReference(referenceSource);

    const queryResult = useQuery(queryKey($reference), () => queryFunction($reference), {
        retry: true,
    });

    return React.useMemo(
        () => ({
            fullPath: $reference?.fullPath,
            queryResult,
        }),
        [$reference?.fullPath, queryResult]
    );
};
