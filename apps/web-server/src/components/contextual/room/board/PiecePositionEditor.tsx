import { State, pieceTemplate, OmitVersion } from '@flocon-trpg/core';
import { Checkbox, Col, InputNumber, Row, Space } from 'antd';
import { Gutter } from 'antd/lib/grid/row';
import React from 'react';
import { BufferedInput } from '../../../ui/BufferedInput';
import { EditorGroupHeader } from '../../../ui/EditorGroupHeader';
import { BoardPositionEditorBase } from './BoardPositionEditorBase';

type PieceState = OmitVersion<State<typeof pieceTemplate>>;

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

type Props = {
    state: PieceState;
    onUpdate: (immerRecipe: (pieceState: PieceState) => void) => void;
    showNameInput?: boolean;
};

export const PiecePositionEditor: React.FC<Props> = ({ state, onUpdate, showNameInput }: Props) => {
    let nameElement: JSX.Element | null = null;
    if (showNameInput === true) {
        const inputElement = (
            <BufferedInput
                style={{ width: 150 }}
                bufferDuration='default'
                value={state.name ?? ''}
                onChange={e =>
                    onUpdate(piece => {
                        // nameがない状態をあらわす値として '' と undefined の2種類が混在するのは後々仕様変更があった際に困るかもしれないため、undefinedで統一させるようにしている
                        piece.name = e.currentValue === '' ? undefined : e.currentValue;
                    })
                }
            />
        );
        nameElement = (
            <Row gutter={gutter} align='middle'>
                <Col flex='auto' />
                <Col flex={0}>コマの名前</Col>
                <Col span={inputSpan}>{inputElement}</Col>
            </Row>
        );
    }

    let positionElement: JSX.Element;
    if (state.isCellMode) {
        positionElement = (
            <>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>セルの座標</Col>
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
            <BoardPositionEditorBase
                gutter={gutter}
                inputSpan={inputSpan}
                state={state}
                onUpdate={onUpdate}
            />
        );
    }

    return (
        <div>
            {nameElement}
            <EditorGroupHeader>位置とサイズ</EditorGroupHeader>
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
