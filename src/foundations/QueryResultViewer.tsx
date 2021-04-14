import React, { PropsWithChildren } from 'react';
import { ApolloError } from '@apollo/client';
import { Result } from 'antd';
import * as Icon from '@ant-design/icons';
import LoadingResult from './Result/LoadingResult';

type Props = {
    error?: ApolloError;
    loading?: boolean;
    loadingTitle?: string;
}

const QueryResultViewer: React.FC<PropsWithChildren<Props>> = ({ children, error, loading, loadingTitle }: PropsWithChildren<Props>) => {
    if (error != null) {
        return (<Result status='error' title='APIエラー' subTitle={error.message} />);
    }
    if (loading === true) {
        return <LoadingResult title={loadingTitle} />;
    }
    return (<>{children}</>);
};

export default QueryResultViewer;