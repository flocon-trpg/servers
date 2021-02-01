import React from 'react';
import { Alert } from 'antd';

const Loading: React.FC = () => {
    return (<Alert type='info' message='Loading...' showIcon />);
};

export default Loading;