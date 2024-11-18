import React from 'react';
import { useQuery } from 'urql';
import { GetMyRolesDoc } from '../graphql/GetMyRolesDoc';

export const useGetMyRoles = () => {
    const [getMyRolesQueryResult, getMyRolesQuery] = useQuery({
        query: GetMyRolesDoc,
        pause: true,
    });

    React.useEffect(() => {
        getMyRolesQuery();
    }, [getMyRolesQuery]);

    return getMyRolesQueryResult;
};
