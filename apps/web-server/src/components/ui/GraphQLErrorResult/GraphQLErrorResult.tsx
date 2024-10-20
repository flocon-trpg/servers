import { ObservableError, PromiseError } from '@flocon-trpg/sdk';
import { Result } from 'antd';
import React from 'react';
import { CombinedError } from 'urql';

export type Props = {
    title: string;
    error: CombinedError | PromiseError<CombinedError> | ObservableError<CombinedError>;
};

export const GraphQLErrorResult: React.FC<Props> = ({ title, error }) => {
    const onCombinedError = (error: CombinedError) => {
        return <Result status="error" title={title} subTitle={error.message} />;
    };
    if (error instanceof CombinedError) {
        return onCombinedError(error);
    }
    if (error.type === 'resultError') {
        return onCombinedError(error.value);
    }

    const message = error.value instanceof Error ? error.value.message : '不明なエラー';
    return <Result status="error" title={title} subTitle={message} />;
};
