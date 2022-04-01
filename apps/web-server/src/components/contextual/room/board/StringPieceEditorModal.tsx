import { Checkbox, Col, Modal, Row } from 'antd';
import React from 'react';
import { DialogFooter } from '../../../ui/DialogFooter';
import { Gutter } from 'antd/lib/grid/row';
import { StateEditorParams, useStateEditor } from '../../../../hooks/useStateEditor';
import { characterTemplate, simpleId, State, String, stringPieceTemplate } from '@flocon-trpg/core';
import { useStringPieces } from '../../../../hooks/state/useStringPieces';
import { MyCharactersSelect } from '../character/MyCharactersSelect';
import { useMyUserUid } from '../../../../hooks/useMyUserUid';
import { create, update } from '../../../../utils/constants';
import { useAtom } from 'jotai';
import { useSetRoomStateWithImmer } from '../../../../hooks/useSetRoomStateWithImmer';
import { BufferedInput } from '../../../ui/BufferedInput';
import { PiecePositionWithCell } from '../../../../utils/types';
import { stringPieceValueEditorAtom } from '../../../../atoms/pieceValueEditor/pieceValueEditorAtom';

type CharacterState = State<typeof characterTemplate>;
type StringPieceState = State<typeof stringPieceTemplate>;

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

export const StringPieceEditorModal: React.FC = () => {
    const [modalType, setModalType] = useAtom(stringPieceValueEditorAtom);
    const setRoomState = useSetRoomStateWithImmer();
    const myUserUid = useMyUserUid();
    const stringPieces = useStringPieces(modalType?.boardId);
    const [activeCharacter, setActiveCharacter] = React.useState<{
        id: string;
        state: CharacterState;
    }>();

    let stateEditorParams: StateEditorParams<StringPieceState | undefined> | undefined;
    switch (modalType?.type) {
        case undefined:
            stateEditorParams = undefined;
            break;
        case create:
            stateEditorParams = {
                type: create,
                // createする際にownerCharacterIdをセットする必要がある
                initState: defaultStringPieceValue(modalType.piecePosition, undefined),
            };
            break;
        case update:
            stateEditorParams = {
                type: update,
                state: stringPieces?.get(modalType.pieceId),
                onUpdate: newState => {
                    if (myUserUid == null || modalType?.type !== update) {
                        return;
                    }
                    const boardId = modalType.boardId;
                    const pieceId = modalType.pieceId;
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
    if (modalType != null && modalType?.type === create) {
        onCreate = () => {
            if (activeCharacter == null) {
                return;
            }
            const id = simpleId();
            setRoomState(roomState => {
                const stringPieces = roomState.boards[modalType.boardId]?.stringPieces;
                if (stringPieces == null) {
                    return;
                }
                stringPieces[id] = { ...uiState, ownerCharacterId: activeCharacter.id };
            });
            setModalType(null);
            resetUiState(undefined);
        };
    }

    let visible: boolean;
    switch (modalType?.type) {
        case undefined:
            visible = false;
            break;
        case update:
            visible = !modalType.closed;
            break;
        case create:
            visible = true;
            break;
    }

    return (
        <Modal
            title={modalType?.type == update ? '文字列コマの編集' : '文字列コマの新規作成'}
            visible={visible}
            closable
            onCancel={() => setModalType(null)}
            footer={
                <DialogFooter
                    close={{
                        textType: modalType?.type === update ? 'close' : 'cancel',
                        onClick: () => setModalType(null),
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
                        {modalType?.type === update ? modalType.pieceId : '(なし)'}
                    </Col>
                </Row>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>所有者</Col>
                    <Col span={inputSpan}>
                        <MyCharactersSelect
                            selectedCharacterId={
                                modalType?.type === update
                                    ? uiState.ownerCharacterId
                                    : activeCharacter?.id
                            }
                            readOnly={modalType?.type === update}
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
                        <BufferedInput
                            bufferDuration='default'
                            size='small'
                            value={uiState.value}
                            onChange={({ currentValue }) => {
                                updateUiState(uiState => {
                                    if (uiState == null) {
                                        return;
                                    }
                                    uiState.value = currentValue;
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
