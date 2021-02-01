import React from 'react';
import { Alert } from 'antd';
import { ApolloError } from '@apollo/client';

const Error: React.FC<{ error: ApolloError }> = ({ error }: { error: ApolloError }) => {
    return (<Alert type='error' message={error.message} showIcon />);
};

export default Error;