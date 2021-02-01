import React from 'react';
import { Alert } from 'antd';

const FirebaseAppNotFound: React.FC = () => {
    return (<Alert type='error' message='Firebase app not found.' showIcon />);
};

export default FirebaseAppNotFound;