import React, { PropsWithChildren } from 'react';
import { Alert, Result } from 'antd';
import * as Icon from '@ant-design/icons';
import { LoadingResult } from './result/LoadingResult';
import { CombinedError } from 'urql';

type Props = {
    error?: CombinedError;
    loading?: boolean;
    loadingTitle?: string;
    compact: boolean;
};

export const QueryResultViewer: React.FC<PropsWithChildren<Props>> = ({
    children,
    error,
    loading,
    loadingTitle,
    compact,
}: PropsWithChildren<Props>) => {
    if (error != null) {
        if (compact) {
            return <Alert type='error' showIcon message={`APIエラー: ${error.message}`} />;
        }
        return <Result status='error' title='APIエラー' subTitle={error.message} />;
    }
    if (loading === true) {
        if (compact) {
            return (
                <span>
                    <Icon.LoadingOutlined />
                    {loadingTitle ?? '読み込み中…'}
                </span>
            );
        }
        return <LoadingResult title={loadingTitle} />;
    }
    return <>{children}</>;
};
