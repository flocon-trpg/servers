import {  Col, InputNumber, Row, Space } from 'antd';
import { Gutter } from 'antd/lib/grid/row';
import React from 'react';

type State = {
    x: number;
    y: number;
    w: number;
    h: number;
};

type Props = {
    state: State;
    gutter: [Gutter, Gutter];
    inputSpan: number;
    onUpdate: (immerRecipe: (pieceState: State) => void) => void;
};

export const BoardPositionEditorBase: React.FC<Props> = ({
    state,
    onUpdate,
    gutter,
    inputSpan,
}: Props) => {
    return (
        <>
            <Row gutter={gutter} align='middle'>
                <Col flex='auto' />
                <Col flex={0}>位置</Col>
                <Col span={inputSpan}>
                    <Space>
                        <InputNumber
                            value={state.x}
                            onChange={newValue =>
                                typeof newValue === 'number'
                                    ? onUpdate(piece => {
                                          piece.x = newValue;
                                      })
                                    : undefined
                            }
                        />
                        <span>*</span>
                        <InputNumber
                            value={state.y}
                            onChange={newValue =>
                                typeof newValue === 'number'
                                    ? onUpdate(piece => {
                                          piece.y = newValue;
                                      })
                                    : undefined
                            }
                        />
                    </Space>
                </Col>
            </Row>
            <Row gutter={gutter} align='middle'>
                <Col flex='auto' />
                <Col flex={0}>大きさ</Col>
                <Col span={inputSpan}>
                    <Space>
                        <InputNumber
                            value={state.w}
                            onChange={newValue =>
                                typeof newValue === 'number'
                                    ? onUpdate(piece => {
                                          piece.w = newValue;
                                      })
                                    : undefined
                            }
                        />
                        <span>*</span>
                        <InputNumber
                            value={state.h}
                            onChange={newValue =>
                                typeof newValue === 'number'
                                    ? onUpdate(piece => {
                                          piece.h = newValue;
                                      })
                                    : undefined
                            }
                        />
                    </Space>
                </Col>
            </Row>
        </>
    );
};
