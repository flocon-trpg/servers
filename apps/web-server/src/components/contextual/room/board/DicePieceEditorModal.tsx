import { Col, Modal, Row } from 'antd';
import React from 'react';
import { DialogFooter } from '../../../ui/DialogFooter';
import { replace } from '../../../../stateManagers/states/types';
import { Gutter } from 'antd/lib/grid/row';
import { StateEditorParams, useStateEditor } from '../../../../hooks/useStateEditor';
import { DicePieceState, CharacterState, dicePieceStrIndexes, simpleId } from '@flocon-trpg/core';
import { useDicePieces } from '../../../../hooks/state/useDicePieces';
import { MyCharactersSelect } from '../character/MyCharactersSelect';
import { InputDie } from './die/InputDie';
import { noValue } from '../../../../utils/board/dice';
import { useMyUserUid } from '../../../../hooks/useMyUserUid';
import { create, update } from '../../../../utils/constants';
import { useAtom } from 'jotai';
import { useSetRoomStateWithImmer } from '../../../../hooks/useSetRoomStateWithImmer';
import { BufferedInput } from '../../../ui/BufferedInput';
import { PiecePositionWithCell } from '../../../../utils/types';
import { dicePieceValueEditorAtom } from '../../../../atoms/pieceValueEditor/pieceValueEditorAtom';

const defaultDicePieceValue = (
    piecePosition: PiecePositionWithCell,
    ownerCharacterId: string | undefined
): DicePieceState => ({
    $v: 2,
    $r: 1,

    ownerCharacterId,

    dice: {},
    memo: undefined,
    name: undefined,
    opacity: undefined,
    isPositionLocked: false,
    ...piecePosition,
});

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

export const DicePieceEditorModal: React.FC = () => {
    const [modalType, setModalType] = useAtom(dicePieceValueEditorAtom);
    const setRoomState = useSetRoomStateWithImmer();
    const myUserUid = useMyUserUid();
    const dicePieces = useDicePieces(modalType?.boardId);
    const [activeCharacter, setActiveCharacter] = React.useState<{
        id: string;
        state: CharacterState;
    }>();
    let stateEditorParams: StateEditorParams<DicePieceState | undefined> | undefined;
    switch (modalType?.type) {
        case undefined:
            stateEditorParams = undefined;
            break;
        case create:
            stateEditorParams = {
                type: create,

                // createする際にownerCharacterIdをセットする必要がある
                initState: defaultDicePieceValue(modalType.piecePosition, undefined),
            };
            break;
        case update:
            stateEditorParams = {
                type: update,
                state: dicePieces?.get(modalType.pieceId),
                onUpdate: newState => {
                    if (myUserUid == null || modalType?.type !== update) {
                        return;
                    }
                    const boardId = modalType.boardId;
                    const pieceId = modalType.pieceId;
                    setRoomState(roomState => {
                        const dicePieces = roomState.boards[boardId]?.dicePieces;
                        if (dicePieces == null) {
                            return;
                        }
                        dicePieces[pieceId] = newState;
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
    if (modalType != null && modalType.type === create) {
        onCreate = () => {
            if (activeCharacter == null) {
                return;
            }
            const id = simpleId();
            setRoomState(roomState => {
                const dicePieces = roomState.boards[modalType.boardId]?.dicePieces;
                if (dicePieces == null) {
                    return;
                }
                dicePieces[id] = { ...uiState, ownerCharacterId: activeCharacter.id };
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
            title={modalType?.type === update ? 'ダイスコマの編集' : 'ダイスコマの新規作成'}
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

                {dicePieceStrIndexes.map(key => {
                    const die = uiState.dice[key];

                    return (
                        <Row key={key} style={{ minHeight: 28 }} gutter={gutter} align='middle'>
                            <Col flex='auto' />
                            <Col flex={0}>{`ダイス${key}`}</Col>
                            <Col span={inputSpan}>
                                <InputDie
                                    size='small'
                                    state={die ?? null}
                                    onChange={e => {
                                        updateUiState(pieceValue => {
                                            if (pieceValue == null) {
                                                return;
                                            }
                                            if (e.type === replace) {
                                                pieceValue.dice[key] =
                                                    e.newValue == null
                                                        ? undefined
                                                        : {
                                                              $v: 1,
                                                              $r: 1,
                                                              dieType: e.newValue.dieType,
                                                              isValuePrivate: false,
                                                              value: undefined,
                                                          };
                                                return;
                                            }
                                            const die = pieceValue.dice[key];
                                            if (die == null) {
                                                return;
                                            }
                                            die.value =
                                                e.newValue === noValue ? undefined : e.newValue;
                                        });
                                    }}
                                    onIsValuePrivateChange={e => {
                                        updateUiState(pieceValue => {
                                            const die = pieceValue?.dice[key];
                                            if (die == null) {
                                                return;
                                            }
                                            die.isValuePrivate = e;
                                        });
                                    }}
                                />
                            </Col>
                        </Row>
                    );
                })}
            </div>
        </Modal>
    );
};
