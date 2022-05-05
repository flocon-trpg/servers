import { useLazyQuery } from '@apollo/client';
import { GetMyRolesDocument } from '@flocon-trpg/typed-document-node-v0.7.2';
import React from 'react';
import { useIsV072OrLater } from './useIsV072OrLater';

export const useGetMyRoles = () => {
    const isV072OrLater = useIsV072OrLater();
    const [getMyRolesQuery, getMyRolesQueryResult] = useLazyQuery(GetMyRolesDocument);

    React.useEffect(() => {
        if (isV072OrLater) {
            getMyRolesQuery();
        }
    }, [getMyRolesQuery, isV072OrLater]);

    return getMyRolesQueryResult;
};
