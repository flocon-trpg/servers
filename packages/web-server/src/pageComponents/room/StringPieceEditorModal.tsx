import { Checkbox, Col, InputNumber, Modal, Row } from 'antd';
import React from 'react';
import { DrawerFooter } from '../../layouts/DrawerFooter';
import { Gutter } from 'antd/lib/grid/row';
import { StateEditorParams, useStateEditor } from '../../hooks/useStateEditor';
import {
    StringPieceState,
    CharacterState,
    simpleId,
    String
} from '@flocon-trpg/core';
import { useStringPieces } from '../../hooks/state/useStringPieces';
import { MyCharactersSelect } from '../../components/MyCharactersSelect';
import { useMyUserUid } from '../../hooks/useMyUserUid';
import { create, update } from '../../utils/constants';
import { atom, useAtom } from 'jotai';
import { useSetRoomStateWithImmer } from '../../hooks/useSetRoomStateWithImmer';
import { PieceValueEditorType } from '../../utils/pieceValueEditorType';
import { BufferedInput } from '../../components/BufferedInput';
import { PiecePositionWithCell } from '../../utils/types';

export const stringPieceEditorModalAtom = atom<PieceValueEditorType | null>(null);

const defaultStringPieceValue = (
    piecePosition: PiecePositionWithCell,
    ownerCharacterId: string | undefined
): StringPieceState => ({
    $v: 2,
    $r: 1,

    ownerCharacterId,
    value: '',
    isValuePrivate: false,
    valueInputType: String,
    memo: undefined,
    name: undefined,
    opacity: undefined,
    isPositionLocked: false,
    ...piecePosition,
});

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

const parseIntSafe = (value: string) => {
    const result = parseInt(value, 10);
    if (Number.isNaN(result) || !Number.isFinite(result)) {
        return 0;
    }
    return result;
};

export const StringPieceEditorModal: React.FC = () => {
    const [drawerType, setDrawerType] = useAtom(stringPieceEditorModalAtom);
    const setRoomState = useSetRoomStateWithImmer();
    const myUserUid = useMyUserUid();
    const stringPieces = useStringPieces(drawerType?.boardId);
    const [activeCharacter, setActiveCharacter] = React.useState<{
        id: string;
        state: CharacterState;
    }>();

    let stateEditorParams: StateEditorParams<StringPieceState | undefined>;
    switch (drawerType?.type) {
        case undefined:
            stateEditorParams = {
                type: create,
                initState: undefined,
            };
            break;
        case create:
            stateEditorParams = {
                type: create,
                initState: defaultStringPieceValue(drawerType.piecePosition, myUserUid),
            };
            break;
        case update:
            stateEditorParams = {
                type: update,
                state: stringPieces?.get(drawerType.pieceId),
                onUpdate: newState => {
                    if (myUserUid == null || drawerType?.type !== update) {
                        return;
                    }
                    const boardId = drawerType.boardId;
                    const pieceId = drawerType.pieceId;
                    setRoomState(roomState => {
                        const stringPieces = roomState.boards[boardId]?.stringPieces;
                        if (stringPieces == null) {
                            return;
                        }
                        stringPieces[pieceId] = newState;
                    });
                },
            };
            break;
    }
    const { uiState, updateUiState, resetUiState } = useStateEditor(stateEditorParams);

    if (myUserUid == null || uiState == null) {
        return null;
    }

    let onCreate: (() => void) | undefined = undefined;
    // drawerType != nullを付けていることで、updateから閉じる際に一瞬onCreateボタンが出るのを防いでいる。ただし、これで適切なのかどうかは吟味していない
    if (drawerType != null && drawerType?.type === create) {
        onCreate = () => {
            const id = simpleId();
            setRoomState(roomState => {
                const stringPieces = roomState.boards[drawerType.boardId]?.stringPieces;
                if (stringPieces == null) {
                    return;
                }
                stringPieces[id] = uiState;
            });
            setDrawerType(null);
            resetUiState(undefined);
        };
    }

    return (
        <Modal
            title={drawerType?.type == update ? '数値コマの編集' : '数値コマの新規作成'}
            visible={drawerType != null}
            closable
            onCancel={() => setDrawerType(null)}
            footer={
                <DrawerFooter
                    close={{
                        textType: drawerType?.type === update ? 'close' : 'cancel',
                        onClick: () => setDrawerType(null),
                    }}
                    ok={onCreate == null ? undefined : { textType: 'create', onClick: onCreate }}
                />
            }
        >
            <div>
        <Row gutter={gutter} align='middle'>
            <Col flex='auto' />
            <Col flex={0}>ID</Col>
            <Col span={inputSpan}>
                {drawerType?.type === update
                    ? drawerType.pieceId
                    : '(なし)'}
            </Col>
        </Row>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>所有者</Col>
                    <Col span={inputSpan}>
                        <MyCharactersSelect
                            selectedCharacterId={
                                drawerType?.type === update
                                    ? uiState.ownerCharacterId
                                    : activeCharacter?.id
                            }
                            readOnly={drawerType?.type === update}
                            onSelect={setActiveCharacter}
                        />
                    </Col>
                </Row>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>名前</Col>
                    <Col span={inputSpan}>
                        <BufferedInput
                            bufferDuration='default'
                            size='small'
                            value={uiState.name ?? ''}
                            onChange={e => {
                                if (e.previousValue === e.currentValue) {
                                    return;
                                }
                                updateUiState(pieceValue => {
                                    if (pieceValue == null) {
                                        return;
                                    }
                                    pieceValue.name = e.currentValue;
                                });
                            }}
                        />
                    </Col>
                </Row>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>値</Col>
                    <Col span={inputSpan}>
                        <InputNumber
                            size='small'
                            value={parseIntSafe(uiState.value)}
                            onChange={e => {
                                updateUiState(uiState => {
                                    if (uiState == null) {
                                        return;
                                    }
                                    uiState.value = e.toString();
                                });
                            }}
                        />
                    </Col>
                </Row>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>値を非公開にする</Col>
                    <Col span={inputSpan}>
                        <Checkbox
                            checked={uiState.isValuePrivate}
                            onChange={e =>
                                updateUiState(uiState => {
                                    if (uiState == null) {
                                        return;
                                    }
                                    uiState.isValuePrivate = e.target.checked;
                                })
                            }
                        />
                    </Col>
                </Row>
            </div>
        </Modal>
    );
};
