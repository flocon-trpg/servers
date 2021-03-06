import { Result } from 'antd';
import React from 'react';
import * as Icon from '@ant-design/icons';

const NotSignInResult: React.FC = () => {
    return <Result
        status='warning'
        title="ログインしていません。"
        subTitle="このページを表示するにはログインする必要があります。"
    />;
};

export default NotSignInResult;