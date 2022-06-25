import { useQuery } from 'urql';
import { GetMyRolesDocument } from '@flocon-trpg/typed-document-node-v0.7.2';
import React from 'react';
import { useIsV072OrLater } from './useIsV072OrLater';

export const useGetMyRoles = () => {
    const isV072OrLater = useIsV072OrLater();
    const [getMyRolesQueryResult, getMyRolesQuery] = useQuery({
        query: GetMyRolesDocument,
        pause: true,
    });

    React.useEffect(() => {
        if (isV072OrLater) {
            getMyRolesQuery();
        }
    }, [getMyRolesQuery, isV072OrLater]);

    return getMyRolesQueryResult;
};
