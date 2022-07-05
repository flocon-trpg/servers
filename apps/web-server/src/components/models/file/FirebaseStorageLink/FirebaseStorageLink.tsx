import { StorageReference } from 'firebase/storage';
import React from 'react';
import { fileName } from '@/utils/filename';
import { useFirebaseUrl } from '@/hooks/useFirebaseUrl';
import { Alert } from 'antd';

type Props = {
    reference: StorageReference | string;
};

export const FirebaseStorageLink: React.FC<Props> = ({ reference }: Props) => {
    const { queryResult, fullPath } = useFirebaseUrl({ reference });

    if (fullPath == null) {
        return (
            <Alert
                type='warning'
                message='fullPathの値がundefinedです。Firebase Storage インスタンスがnullの可能性があります。'
            />
        );
    }

    if (queryResult.data == null) {
        return <span>{fileName(fullPath)}</span>;
    }

    return (
        <a href={queryResult.data} target='_blank' rel='noopener noreferrer'>
            {fileName(fullPath)}
        </a>
    );
};
