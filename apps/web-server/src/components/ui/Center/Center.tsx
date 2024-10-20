import { Col, Row } from 'antd';
import React, { PropsWithChildren } from 'react';

type Props = { setPaddingY: boolean };

export const Center: React.FC<PropsWithChildren<Props>> = ({
    children,
    setPaddingY,
}: PropsWithChildren<Props>) => {
    return (
        <Row
            style={{ height: '100%', padding: `${setPaddingY ? 16 : 0}px 0` }}
            justify="center"
            align="middle"
        >
            <Col flex={1} />
            <Col flex={0}>{children}</Col>
            <Col flex={1} />
        </Row>
    );
};
