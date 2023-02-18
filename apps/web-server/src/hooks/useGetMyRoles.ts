import { GetMyRolesDocument } from '@flocon-trpg/typed-document-node-v0.7.13';
import React from 'react';
import { useQuery } from 'urql';

export const useGetMyRoles = () => {
    const [getMyRolesQueryResult, getMyRolesQuery] = useQuery({
        query: GetMyRolesDocument,
        pause: true,
    });

    React.useEffect(() => {
        getMyRolesQuery();
    }, [getMyRolesQuery]);

    return getMyRolesQueryResult;
};
