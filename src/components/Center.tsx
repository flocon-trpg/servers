import React from 'react';
import { PropsWithChildren } from 'react';
import { Row, Col } from 'antd';

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const Center: React.FC<PropsWithChildren<Props>> = ({ children }: PropsWithChildren<Props>) => {
    return (
        <Row style={{ height: '100%' }} justify='center' align='middle'>
            <Col flex={1} />
            <Col flex={0}>{children}</Col>
            <Col flex={1} />
        </Row>
    );
};

export default Center;
