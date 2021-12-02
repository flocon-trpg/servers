import { PieceState } from '@flocon-trpg/core';
import { Checkbox, Col, InputNumber, Row, Space } from 'antd';
import { Gutter } from 'antd/lib/grid/row';
import React from 'react';
import { PositionEditor } from './PositionEditor';

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

type Props = {
    state: PieceState;
    onUpdate: (immerRecipe: (pieceState: PieceState) => void) => void;
};

export const PieceEditor: React.FC<Props> = ({ state, onUpdate }: Props) => {
    let positionElement: JSX.Element;
    if (state.isCellMode) {
        positionElement = (
            <>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>セルの位置</Col>
                    <Col span={inputSpan}>
                        <Space>
                            <InputNumber
                                value={state.cellX}
                                onChange={newValue =>
                                    typeof newValue === 'number'
                                        ? onUpdate(piece => {
                                              piece.cellX = newValue;
                                          })
                                        : undefined
                                }
                            />
                            <span>*</span>
                            <InputNumber
                                value={state.cellY}
                                onChange={newValue =>
                                    typeof newValue === 'number'
                                        ? onUpdate(piece => {
                                              piece.cellY = newValue;
                                          })
                                        : undefined
                                }
                            />
                        </Space>
                    </Col>
                </Row>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>セルの大きさ</Col>
                    <Col span={inputSpan}>
                        <Space>
                            <InputNumber
                                value={state.cellW}
                                onChange={newValue =>
                                    typeof newValue === 'number'
                                        ? onUpdate(piece => {
                                              piece.cellW = newValue;
                                          })
                                        : undefined
                                }
                            />
                            <span>*</span>
                            <InputNumber
                                value={state.cellH}
                                onChange={newValue =>
                                    typeof newValue === 'number'
                                        ? onUpdate(piece => {
                                              piece.cellH = newValue;
                                          })
                                        : undefined
                                }
                            />
                        </Space>
                    </Col>
                </Row>
            </>
        );
    } else {
        positionElement = (
            <PositionEditor
                gutter={gutter}
                inputSpan={inputSpan}
                state={state}
                onUpdate={onUpdate}
            />
        );
    }

    return (
        <div>
            <Row gutter={gutter} align='middle'>
                <Col flex='auto' />
                <Col flex={0}></Col>
                <Col span={inputSpan}>
                    <Checkbox
                        checked={state.isCellMode}
                        onChange={e =>
                            onUpdate(piece => {
                                piece.isCellMode = e.target.checked;
                            })
                        }
                    >
                        セルにスナップする
                    </Checkbox>
                </Col>
            </Row>
            {positionElement}
            <Row gutter={gutter} align='middle'>
                <Col flex='auto' />
                <Col flex={0}></Col>
                <Col span={inputSpan}>
                    <Checkbox
                        checked={state.isPositionLocked}
                        onChange={e =>
                            onUpdate(piece => {
                                piece.isPositionLocked = e.target.checked;
                            })
                        }
                    >
                        位置を固定する
                    </Checkbox>
                </Col>
            </Row>
        </div>
    );
};
