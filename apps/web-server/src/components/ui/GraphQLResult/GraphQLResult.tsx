import React, { PropsWithChildren } from 'react';
import { Props as ErrorProps, GraphQLErrorResult } from '../GraphQLErrorResult/GraphQLErrorResult';
import { LoadingResult } from '../LoadingResult/LoadingResult';

type Props = {
    error?: ErrorProps;
    loading?: boolean;
    loadingTitle?: string;
};

export const GraphQLResult: React.FC<PropsWithChildren<Props>> = ({
    children,
    error,
    loading,
    loadingTitle,
}) => {
    if (error == null) {
        if (loading === true) {
            return <LoadingResult title={loadingTitle} />;
        }
        return <>{children}</>;
    }

    return <GraphQLErrorResult {...error} />;
};
