import { Checkbox, Col, InputNumber, Modal, Row } from 'antd';
import React from 'react';
import { DrawerFooter } from '../../layouts/DrawerFooter';
import { Gutter } from 'antd/lib/grid/row';
import { StateEditorParams, useStateEditor } from '../../hooks/useStateEditor';
import {
    StringPieceValueState,
    CharacterState,
    simpleId,
} from '@flocon-trpg/core';
import { useStringPieceValues } from '../../hooks/state/useStringPieceValues';
import { MyCharactersSelect } from '../../components/MyCharactersSelect';
import { useMyUserUid } from '../../hooks/useMyUserUid';
import { keyNames } from '@flocon-trpg/utils';
import { useAtomValue } from 'jotai/utils';
import { create, update } from '../../utils/constants';
import { atom, useAtom } from 'jotai';
import { useSetRoomStateWithImmer } from '../../hooks/useSetRoomStateWithImmer';
import { dicePieceValueEditorModalAtom } from './DicePieceValueEditorModal';
import { PieceValueEditorType } from '../../utils/pieceValueEditorType';

export const stringPieceEditorModalAtom = atom<PieceValueEditorType | null>(null);

const defaultStringPieceValue: StringPieceValueState = {
    $v: 2,
    $r: 1,

    // createするときはこれに自身のIDを入れなければならない
    ownerCharacterId: undefined,

    value: '',
    isValuePrivate: false,
    memo: undefined,
    name: undefined,
    pieces: {},
};

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

const IdView: React.FC = () => {
    const drawerType = useAtomValue(dicePieceValueEditorModalAtom);
    const myUserUid = useMyUserUid();

    if (drawerType == null || myUserUid == null) {
        return null;
    }

    return (
        <Row gutter={gutter} align='middle'>
            <Col flex='auto' />
            <Col flex={0}>ID</Col>
            <Col span={inputSpan}>
                {drawerType.type === update
                    ? keyNames({ createdBy: myUserUid, id: drawerType.stateId })
                    : '(なし)'}
            </Col>
        </Row>
    );
};

const parseIntSafe = (value: string) => {
    const result = parseInt(value, 10);
    if (Number.isNaN(result) || !Number.isFinite(result)) {
        return 0;
    }
    return result;
};

export const StringPieceValueDrawer: React.FC = () => {
    const [drawerType, setDrawerType] = useAtom(stringPieceEditorModalAtom);
    const setRoomState = useSetRoomStateWithImmer();
    const myUserUid = useMyUserUid();
    const stringPieceValues = useStringPieceValues();
    const [activeCharacter, setActiveCharacter] = React.useState<{
        id: string;
        state: CharacterState;
    }>();

    let stateEditorParams: StateEditorParams<typeof defaultStringPieceValue | undefined>;
    switch (drawerType?.type) {
        case create:
        case undefined:
            stateEditorParams = {
                type: create,
                initState: defaultStringPieceValue,
            };
            break;
        case update:
            stateEditorParams = {
                type: update,
                state: stringPieceValues?.find(
                    value =>
                        value.value.ownerCharacterId === myUserUid &&
                        value.id === drawerType.stateId
                )?.value,
                onUpdate: newState => {
                    if (myUserUid == null || drawerType?.type !== update) {
                        return;
                    }
                    const stateId = drawerType.stateId;
                    setRoomState(roomState => {
                        roomState.stringPieceValues[stateId] = newState;
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
            if (activeCharacter == null) {
                return;
            }

            const piece = drawerType.piece;
            const id = simpleId();
            setRoomState(roomState => {
                roomState.stringPieceValues[id] = {
                    ...uiState,
                    ownerCharacterId: activeCharacter.id,
                    pieces:
                        piece == null
                            ? {}
                            : {
                                  [drawerType.piece.boardId]: piece,
                              },
                };
            });
            setDrawerType(null);
            setActiveCharacter(undefined);
            resetUiState(defaultStringPieceValue);
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
                <IdView />
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
