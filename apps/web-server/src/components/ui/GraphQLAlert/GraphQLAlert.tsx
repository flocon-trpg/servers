import * as Icon from '@ant-design/icons';
import React, { PropsWithChildren } from 'react';
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
                <span>
                    <Icon.LoadingOutlined />
                    {loadingTitle ?? '読み込み中…'}
                </span>
            );
        }
        return <>{children}</>;
    }

    return <GraphQLErrorAlert {...error} />;
};
