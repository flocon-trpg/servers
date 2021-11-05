import { Result } from 'antd';
import React from 'react';

export const NotSignInResult: React.FC = () => {
    return (
        <Result
            status='warning'
            title='ログインしていません。'
            subTitle='このページを表示するにはログインする必要があります。'
        />
    );
};
