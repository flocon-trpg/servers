import { ObservableError, PromiseError } from '@flocon-trpg/sdk';
import { Alert } from 'antd';
import React from 'react';
import { CombinedError } from 'urql';
import { AlertCounter } from '../AlertCounter/AlertCounter';

export type Props = {
    mainMessage: string;
    error: CombinedError | PromiseError<CombinedError> | ObservableError<CombinedError>;
};

export const GraphQLErrorAlert: React.FC<Props> = ({ mainMessage, error }) => {
    const onCombinedError = (error: CombinedError) => {
        return (
            <AlertCounter.Alert
                type="error"
                showIcon
                message={`${mainMessage}: ${error.message}`}
            />
        );
    };
    if (error instanceof CombinedError) {
        return onCombinedError(error);
    }
    if (error.type === 'resultError') {
        return onCombinedError(error.value);
    }

    const message = error.value instanceof Error ? error.value.message : '不明なエラー';
    return <AlertCounter.Alert type="error" showIcon message={`${mainMessage}: ${message}`} />;
};
