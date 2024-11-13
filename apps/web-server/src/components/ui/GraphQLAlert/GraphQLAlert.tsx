import * as Icon from '@ant-design/icons';
import React, { PropsWithChildren } from 'react';
import { AlertCounter } from '../AlertCounter/AlertCounter';
import { Props as ErrorProps, GraphQLErrorAlert } from '../GraphQLErrorAlert/GraphQLErrorAlert';

type Props = {
    error?: ErrorProps;
    loading?: boolean;
    loadingTitle?: string;
};

export const GraphQLAlert: React.FC<PropsWithChildren<Props>> = ({
    children,
    error,
    loading,
    loadingTitle,
}) => {
    if (error == null) {
        if (loading === true) {
            return (
                <AlertCounter.CountAsLoading>
                    {' '}
                    <span>
                        <Icon.LoadingOutlined />
                        {loadingTitle ?? '読み込み中…'}
                    </span>
                </AlertCounter.CountAsLoading>
            );
        }
        return <>{children}</>;
    }

    return <GraphQLErrorAlert {...error} />;
};
