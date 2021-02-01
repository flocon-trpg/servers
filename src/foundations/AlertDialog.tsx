import React, { PropsWithChildren } from 'react';
import { AlertProps } from 'antd/lib/alert';
import { Col, Row, Alert } from 'antd';

export type Props = {
    alert?: JSX.Element;
};

const AlertDialog: React.FC<PropsWithChildren<Props>> = ({ children, alert }: PropsWithChildren<Props>) => {
    if (alert != null) {
        return (
            <Row justify="center">
                <Col>
                    {alert}
                </Col>
            </Row>);
    }
    return (<>{children}</>);
};

export default AlertDialog;