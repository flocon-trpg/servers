import { OmitVersion, State, boardPositionTemplate, pieceTemplate } from '@flocon-trpg/core';
import { Col, InputNumber, Row, Space } from 'antd';
import { Gutter } from 'antd/lib/grid/row';
import produce from 'immer';
import React from 'react';
import { CollaborativeInput } from '../../../../../../ui/CollaborativeInput/CollaborativeInput';
import { IsCellModeSelector } from './subcomponents/components/IsCellModeSelector/IsCellModeSelector';
import { IsPositionLockedSelector } from './subcomponents/components/IsPositionLockedSelector/IsPositionLockedSelector';

// isPositionLocked == true の場合、いくつかのComponentはUIに一貫性を持たせるためにdisabledとなるようにしている。ただしもし常にdisabled === falseでも動作に支障はない。

type BoardPositionState = OmitVersion<State<typeof boardPositionTemplate>>;

type PieceState = OmitVersion<State<typeof pieceTemplate>>;

type PropsBase<T> = {
    value: T;
    onChange: (newValue: T) => void;
    gutter: [Gutter, Gutter];
    inputSpan: number;
};

const NameRow = <T extends BoardPositionState>({
    value,
    onChange,
    gutter,
    inputSpan,
}: PropsBase<T>) => {
    return (
        <Row gutter={gutter} align='middle'>
            <Col flex='auto' />
            <Col flex={0}>コマの名前</Col>
            <Col span={inputSpan}>
                <CollaborativeInput
                    style={{ width: 150 }}
                    bufferDuration='default'
                    value={value.name ?? ''}
                    onChange={e => {
                        const newValue = produce(value, state => {
                            // nameがない状態をあらわす値として '' と undefined の2種類が混在するのは後々仕様変更があった際に困るかもしれないため、undefinedで統一させるようにしている
                            state.name = e.currentValue === '' ? undefined : e.currentValue;
                        });
                        onChange(newValue);
                    }}
                />
            </Col>
        </Row>
    );
};

const CellPositionEditorRow = <T extends PieceState>({
    value,
    onChange,
    gutter,
    inputSpan,
    disabled,
}: PropsBase<T> & { disabled: boolean }) => {
    return (
        <>
            <Row gutter={gutter} align='middle'>
                <Col flex='auto' />
                <Col flex={0}>セルの座標</Col>
                <Col span={inputSpan}>
                    <Space>
                        <InputNumber
                            disabled={disabled}
                            value={value.cellX}
                            onChange={newValue => {
                                if (typeof newValue !== 'number') {
                                    return;
                                }
                                const newState = produce(value, state => {
                                    state.cellX = newValue;
                                });
                                onChange(newState);
                            }}
                        />
                        <span>*</span>
                        <InputNumber
                            disabled={disabled}
                            value={value.cellY}
                            onChange={newValue => {
                                if (typeof newValue !== 'number') {
                                    return;
                                }
                                const newState = produce(value, state => {
                                    state.cellY = newValue;
                                });
                                onChange(newState);
                            }}
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
                            disabled={disabled}
                            value={value.cellW}
                            onChange={newValue => {
                                if (typeof newValue !== 'number') {
                                    return;
                                }
                                const newState = produce(value, state => {
                                    state.cellW = newValue;
                                });
                                onChange(newState);
                            }}
                        />
                        <span>*</span>
                        <InputNumber
                            disabled={disabled}
                            value={value.cellH}
                            onChange={newValue => {
                                if (typeof newValue !== 'number') {
                                    return;
                                }
                                const newState = produce(value, state => {
                                    state.cellH = newValue;
                                });
                                onChange(newState);
                            }}
                        />
                    </Space>
                </Col>
            </Row>
        </>
    );
};

const PixelPositionEditorRow = <T extends BoardPositionState>({
    value,
    onChange,
    gutter,
    inputSpan,
    disabled,
}: PropsBase<T> & { disabled: boolean }) => {
    return (
        <>
            <Row gutter={gutter} align='middle'>
                <Col flex='auto' />
                <Col flex={0}>座標</Col>
                <Col span={inputSpan}>
                    <Space>
                        <InputNumber
                            disabled={disabled}
                            value={value.x}
                            onChange={newValue => {
                                if (typeof newValue !== 'number') {
                                    return;
                                }
                                const newState = produce(value, state => {
                                    state.x = newValue;
                                });
                                onChange(newState);
                            }}
                        />
                        <span>*</span>
                        <InputNumber
                            disabled={disabled}
                            value={value.y}
                            onChange={newValue => {
                                if (typeof newValue !== 'number') {
                                    return;
                                }
                                const newState = produce(value, state => {
                                    state.y = newValue;
                                });
                                onChange(newState);
                            }}
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
                            disabled={disabled}
                            value={value.w}
                            onChange={newValue => {
                                if (typeof newValue !== 'number') {
                                    return;
                                }
                                const newState = produce(value, state => {
                                    state.w = newValue;
                                });
                                onChange(newState);
                            }}
                        />
                        <span>*</span>
                        <InputNumber
                            disabled={disabled}
                            value={value.h}
                            onChange={newValue => {
                                if (typeof newValue !== 'number') {
                                    return;
                                }
                                const newState = produce(value, state => {
                                    state.h = newValue;
                                });
                                onChange(newState);
                            }}
                        />
                    </Space>
                </Col>
            </Row>
        </>
    );
};

const IsCellModeSelectorRow = <T extends PieceState>({
    value,
    onChange,
    gutter,
    inputSpan,
    disabled,
    boardId,
}: PropsBase<T> & { boardId: string; disabled: boolean }) => {
    return (
        <Row gutter={gutter} align='middle'>
            <Col flex='auto' />
            <Col flex={0}></Col>
            <Col span={inputSpan}>
                <IsCellModeSelector
                    disabled={disabled}
                    value={value}
                    onChange={onChange}
                    boardId={boardId}
                />
            </Col>
        </Row>
    );
};

const IsPositionLockedSelectorRow = <T extends BoardPositionState>({
    value,
    onChange,
    gutter,
    inputSpan,
}: PropsBase<T>) => {
    return (
        <Row gutter={gutter} align='middle'>
            <Col flex='auto' />
            <Col flex={0}></Col>
            <Col span={inputSpan}>
                <IsPositionLockedSelector value={value} onChange={onChange} />
            </Col>
        </Row>
    );
};

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

type Props<T> = {
    value: T;
    onChange: (newValue: T) => void;
    showNameInput?: boolean;
};

export const BoardPositionRectEditor = <T extends BoardPositionState>({
    value,
    onChange,
    showNameInput,
}: Props<T>) => {
    return (
        <div>
            {showNameInput && (
                <NameRow value={value} onChange={onChange} gutter={gutter} inputSpan={inputSpan} />
            )}
            <IsPositionLockedSelectorRow
                value={value}
                onChange={onChange}
                gutter={gutter}
                inputSpan={inputSpan}
            />
            <PixelPositionEditorRow
                disabled={value.isPositionLocked}
                value={value}
                onChange={onChange}
                gutter={gutter}
                inputSpan={inputSpan}
            />
        </div>
    );
};

export const PieceRectEditor = <T extends PieceState>({
    value,
    onChange,
    showNameInput,
    boardId,
}: Props<T> & { boardId: string }) => {
    return (
        <div>
            {showNameInput && (
                <NameRow value={value} onChange={onChange} gutter={gutter} inputSpan={inputSpan} />
            )}
            <IsPositionLockedSelectorRow
                value={value}
                onChange={onChange}
                gutter={gutter}
                inputSpan={inputSpan}
            />
            <IsCellModeSelectorRow
                disabled={value.isPositionLocked}
                value={value}
                onChange={onChange}
                gutter={gutter}
                inputSpan={inputSpan}
                boardId={boardId}
            />
            {value.isCellMode ? (
                <CellPositionEditorRow
                    disabled={value.isPositionLocked}
                    value={value}
                    onChange={onChange}
                    gutter={gutter}
                    inputSpan={inputSpan}
                />
            ) : (
                <PixelPositionEditorRow
                    disabled={value.isPositionLocked}
                    value={value}
                    onChange={onChange}
                    gutter={gutter}
                    inputSpan={inputSpan}
                />
            )}
        </div>
    );
};
