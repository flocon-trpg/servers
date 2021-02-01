import React, { PropsWithChildren } from 'react';
import { ApolloError } from '@apollo/client';
import { Alert } from 'antd';
import AlertDialog from './AlertDialog';
import Loading from '../components/alerts/Loading';
import ApolloErrorDialog from '../components/alerts/ApolloError';

type Props = {
    error?: ApolloError;
    loading?: boolean;
}

const QueryResultViewer: React.FC<PropsWithChildren<Props>> = ({ children, error, loading: isLoading }: PropsWithChildren<Props>) => {
    if (error != null) {
        return (<AlertDialog alert={(<ApolloErrorDialog error={error} />)} />);
    }
    if (isLoading === true) {
        return (<AlertDialog alert={(<Loading />)} />);
    }
    return (<>{children}</>);
};

export default QueryResultViewer;