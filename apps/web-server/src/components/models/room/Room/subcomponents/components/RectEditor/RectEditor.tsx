import { TableRow } from '@/components/ui/Table/Table';
import { OmitVersion, State, boardPositionTemplate, pieceTemplate } from '@flocon-trpg/core';
import { InputNumber, Space } from 'antd';
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
};

const NameRow = <T extends BoardPositionState>({ value, onChange }: PropsBase<T>) => {
    return (
        <TableRow label='コマの名前'>
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
        </TableRow>
    );
};

const CellPositionEditorRow = <T extends PieceState>({
    value,
    onChange,
    disabled,
}: PropsBase<T> & { disabled: boolean }) => {
    return (
        <>
            <TableRow label='セルの座標'>
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
            </TableRow>
            <TableRow label='セルの大きさ'>
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
            </TableRow>
        </>
    );
};

const PixelPositionEditorRow = <T extends BoardPositionState>({
    value,
    onChange,
    disabled,
}: PropsBase<T> & { disabled: boolean }) => {
    return (
        <>
            <TableRow label='座標'>
                <Space>
                    <InputNumber
                        disabled={disabled}
                        size='small'
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
                        size='small'
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
            </TableRow>
            <TableRow label='大きさ'>
                <Space>
                    <InputNumber
                        disabled={disabled}
                        size='small'
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
                        size='small'
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
            </TableRow>
        </>
    );
};

const IsCellModeSelectorRow = <T extends PieceState>({
    value,
    onChange,
    disabled,
    boardId,
}: PropsBase<T> & { boardId: string; disabled: boolean }) => {
    return (
        <TableRow>
            <IsCellModeSelector
                disabled={disabled}
                value={value}
                onChange={onChange}
                boardId={boardId}
            />
        </TableRow>
    );
};

const IsPositionLockedSelectorRow = <T extends BoardPositionState>({
    value,
    onChange,
}: PropsBase<T>) => {
    return (
        <TableRow>
            <IsPositionLockedSelector value={value} onChange={onChange} />
        </TableRow>
    );
};

type Props<T> = {
    value: T;
    onChange: (newValue: T) => void;
    showNameInput?: boolean;
};

// Tableコンポーネントのchildrenとして使う必要がある
export const BoardPositionRectEditor = <T extends BoardPositionState>({
    value,
    onChange,
    showNameInput,
}: Props<T>) => {
    return (
        <>
            {showNameInput && <NameRow value={value} onChange={onChange} />}
            <IsPositionLockedSelectorRow value={value} onChange={onChange} />
            <PixelPositionEditorRow
                disabled={value.isPositionLocked}
                value={value}
                onChange={onChange}
            />
        </>
    );
};

// Tableコンポーネントのchildrenとして使う必要がある
export const PieceRectEditor = <T extends PieceState>({
    value,
    onChange,
    showNameInput,
    boardId,
}: Props<T> & { boardId: string }) => {
    return (
        <>
            {showNameInput && <NameRow value={value} onChange={onChange} />}
            <IsPositionLockedSelectorRow value={value} onChange={onChange} />
            <IsCellModeSelectorRow
                disabled={value.isPositionLocked}
                value={value}
                onChange={onChange}
                boardId={boardId}
            />
            {value.isCellMode ? (
                <CellPositionEditorRow
                    disabled={value.isPositionLocked}
                    value={value}
                    onChange={onChange}
                />
            ) : (
                <PixelPositionEditorRow
                    disabled={value.isPositionLocked}
                    value={value}
                    onChange={onChange}
                />
            )}
        </>
    );
};
