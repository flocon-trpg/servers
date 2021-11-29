import { Button, Col, Modal, Row, Tooltip, Typography } from 'antd';
import React from 'react';
import { DrawerFooter } from '../../layouts/DrawerFooter';
import { InputFile } from '../../components/InputFile';
import { FilesManagerDrawerType } from '../../utils/types';
import { FilesManagerDrawer } from '../../components/FilesManagerDrawer';
import { Gutter } from 'antd/lib/grid/row';
import { NumberParameterInput } from '../../components/NumberParameterInput';
import { BooleanParameterInput } from '../../components/BooleanParameterInput';
import { StringParameterInput } from '../../components/StringParameterInput';
import { ToggleButton } from '../../components/ToggleButton';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import {
    characterIsPrivate,
    characterIsNotPrivate,
    characterIsNotPrivateAndNotCreatedByMe,
} from '../../resource/text/main';
import { StateEditorParams, useStateEditor } from '../../hooks/useStateEditor';
import { BufferedInput } from '../../components/BufferedInput';
import { useCharacters } from '../../hooks/state/useCharacters';
import { useParticipants } from '../../hooks/state/useParticipants';
import {
    useBoolParamNames,
    useNumParamNames,
    useStrParamNames,
} from '../../hooks/state/useParamNames';
import {
    CharacterState,
    strIndex20Array,
    simpleId,
} from '@flocon-trpg/core';
import { useMyUserUid } from '../../hooks/useMyUserUid';
import { BufferedTextArea } from '../../components/BufferedTextArea';
import { FilePath } from '../../utils/filePath';
import { useSetRoomStateWithImmer } from '../../hooks/useSetRoomStateWithImmer';
import { atom, useAtom } from 'jotai';
import { create, update } from '../../utils/constants';
import { useUpdateAtom } from 'jotai/utils';
import { commandEditorModalAtom } from '../../atoms/overlay/commandEditorModalAtom';
import { useIsMyCharacter } from '../../hooks/state/useIsMyCharacter';
import { CharacterVarInput } from '../../components/CharacterVarInput';

export type CharacterEditorDrawerType =
    | {
          type: typeof create;
      }
    | {
          type: typeof update;
          stateId: string;
      };

export const characterEditorDrawerAtom = atom<CharacterEditorDrawerType | null>(null);

const defaultCharacter: CharacterState = {
    $v: 2,
    $r: 1,

    // createするときはこれに自身のIDを入れなければならない
    ownerParticipantId: undefined,

    chatPalette: '',
    memo: '',
    name: '',
    hasTag1: false,
    hasTag2: false,
    hasTag3: false,
    hasTag4: false,
    hasTag5: false,
    hasTag6: false,
    hasTag7: false,
    hasTag8: false,
    hasTag9: false,
    hasTag10: false,
    isPrivate: false,
    image: undefined,
    privateCommands: {},
    privateVarToml: '',
    portraitImage: undefined,
    portraitPositions: {},
    boolParams: {},
    numParams: {},
    numMaxParams: {},
    strParams: {},
    pieces: {},
};

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

export const CharacterEditorModal: React.FC = () => {
    const myUserUid = useMyUserUid();
    const [atomValue, setAtomValue] = useAtom(characterEditorDrawerAtom);
    const setCommandEditorModal = useUpdateAtom(commandEditorModalAtom);
    const setRoomState = useSetRoomStateWithImmer();
    const isMyCharacter = useIsMyCharacter();
    const characters = useCharacters();
    const boolParamNames = useBoolParamNames();
    const numParamNames = useNumParamNames();
    const strParamNames = useStrParamNames();
    const participants = useParticipants();
    let stateEditorParams: StateEditorParams<CharacterState | undefined>;
    switch (atomValue?.type) {
        case create:
        case undefined:
            stateEditorParams = {
                type: create,
                initState: defaultCharacter,
            };
            break;
        case update:
            stateEditorParams = {
                type: update,
                state: characters?.get(atomValue.stateId),
                onUpdate: nextState => {
                    setRoomState(roomState => {
                        roomState.characters[atomValue.stateId] = nextState;
                    });
                },
            };
            break;
    }
    const {
        uiState: character,
        updateUiState: updateCharacter,
        resetUiState: resetCharacterToCreate,
    } = useStateEditor(stateEditorParams);
    const [filesManagerDrawerType, setFilesManagerDrawerType] =
        React.useState<FilesManagerDrawerType | null>(null);

    if (
        boolParamNames == null ||
        numParamNames == null ||
        strParamNames == null ||
        participants == null ||
        myUserUid == null ||
        character == null
    ) {
        return null;
    }

    const createdByMe = (() => {
        if (atomValue?.type !== update) {
            return true;
        }
        return isMyCharacter(atomValue.stateId);
    })();

    let onOkClick: (() => void) | undefined = undefined;
    if (atomValue?.type === create) {
        onOkClick = () => {
            const id = simpleId();
            setRoomState(roomState => {
                roomState.characters[id] = {
                    ...character,
                    ownerParticipantId: myUserUid,
                };
            });
            resetCharacterToCreate();
            setAtomValue(null);
        };
    }

    let onDestroy: (() => void) | undefined = undefined;
    if (atomValue?.type === update) {
        onDestroy = () => {
            setRoomState(roomState => {
                delete roomState.characters[atomValue.stateId];
            });
            setAtomValue(null);
        };
    }

    return (
        <Modal
            title={atomValue?.type === create ? 'キャラクターの新規作成' : 'キャラクターの編集'}
            visible={atomValue != null}
            closable
            footer={
                <DrawerFooter
                    close={{
                        textType: atomValue?.type === create ? 'cancel' : 'close',
                        onClick: () => setAtomValue(null),
                    }}
                    ok={onOkClick == null ? undefined : { textType: 'create', onClick: onOkClick }}
                    destroy={
                        onDestroy == null
                            ? undefined
                            : {
                                  modal: {
                                      title: 'キャラクターの削除の確認',
                                      content: `このキャラクター "${character.name}" を削除します。よろしいですか？`,
                                  },
                                  onClick: onDestroy,
                              }
                    }
                />
            }
        >
            <div>
                {atomValue?.type === update && (
                    <>
                        <Typography.Title level={4}>作成者</Typography.Title>
                        <Row gutter={gutter} align='middle'>
                            <Col flex='auto' />
                            <Col flex={0}>作成者</Col>
                            <Col span={inputSpan}>
                                <span>{participants.get(atomValue.stateId)?.name}</span>
                                {createdByMe && (
                                    <span style={{ paddingLeft: 2, fontWeight: 'bold' }}>
                                        (自分)
                                    </span>
                                )}
                            </Col>
                        </Row>
                    </>
                )}

                {atomValue?.type !== update ? null : (
                    <>
                        <Typography.Title level={4}>複製</Typography.Title>

                        <Row gutter={gutter} align='middle'>
                            <Col flex='auto' />
                            <Col flex={0}></Col>
                            <Col span={inputSpan}>
                                {/* TODO: 複製したことを何らかの形で通知したほうがいい */}
                                <Tooltip title='コマを除き、このキャラクターを複製します。'>
                                    <Button
                                        size='small'
                                        onClick={() => {
                                            const id = simpleId();
                                            setRoomState(roomState => {
                                                roomState.characters[id] = {
                                                    ...character,
                                                    name: `${character.name} (複製)`,
                                                };
                                            });
                                        }}
                                    >
                                        このキャラクターを複製
                                    </Button>
                                </Tooltip>
                            </Col>
                        </Row>
                    </>
                )}

                <Typography.Title level={4}>全体公開</Typography.Title>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>全体公開</Col>
                    <Col span={inputSpan}>
                        <ToggleButton
                            size='small'
                            disabled={
                                createdByMe || atomValue?.type === create
                                    ? false
                                    : characterIsNotPrivateAndNotCreatedByMe
                            }
                            showAsTextWhenDisabled
                            checked={!character.isPrivate}
                            checkedChildren={<EyeOutlined />}
                            unCheckedChildren={<EyeInvisibleOutlined />}
                            tooltip={
                                character.isPrivate
                                    ? characterIsPrivate({ isCreate: atomValue?.type === create })
                                    : characterIsNotPrivate({
                                          isCreate: atomValue?.type === create,
                                      })
                            }
                            onChange={newValue =>
                                updateCharacter(character => {
                                    if (character == null) {
                                        return;
                                    }
                                    character.isPrivate = !newValue;
                                })
                            }
                        />
                    </Col>
                </Row>

                <Typography.Title level={4}>パラメーター</Typography.Title>

                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>名前</Col>
                    <Col span={inputSpan}>
                        <BufferedInput
                            bufferDuration='default'
                            size='small'
                            value={character.name}
                            onChange={e => {
                                if (e.previousValue === e.currentValue) {
                                    return;
                                }
                                updateCharacter(character => {
                                    if (character == null) {
                                        return;
                                    }
                                    character.name = e.currentValue;
                                });
                            }}
                        />
                    </Col>
                </Row>

                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>アイコン画像</Col>
                    <Col span={inputSpan}>
                        <InputFile
                            filePath={character.image ?? undefined}
                            onPathChange={path =>
                                updateCharacter(character => {
                                    if (character == null) {
                                        return;
                                    }
                                    character.image =
                                        path == null ? undefined : FilePath.toOt(path);
                                })
                            }
                            openFilesManager={setFilesManagerDrawerType}
                            showImage
                        />
                    </Col>
                </Row>

                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>立ち絵画像</Col>
                    <Col span={inputSpan}>
                        <InputFile
                            filePath={character.portraitImage ?? undefined}
                            onPathChange={path =>
                                updateCharacter(character => {
                                    if (character == null) {
                                        return;
                                    }
                                    character.portraitImage =
                                        path == null ? undefined : FilePath.toOt(path);
                                })
                            }
                            openFilesManager={setFilesManagerDrawerType}
                            showImage
                        />
                    </Col>
                </Row>

                {strIndex20Array.map(key => {
                    const paramName = numParamNames.get(key);
                    if (paramName === undefined) {
                        return null;
                    }
                    const value = character.numParams[key];
                    const maxValue = character.numMaxParams[key];
                    return (
                        <Row key={`numParam${key}Row`} gutter={gutter} align='middle'>
                            <Col flex='auto' />
                            <Col flex={0}>{paramName.name}</Col>
                            <Col span={inputSpan}>
                                <NumberParameterInput
                                    isCharacterPrivate={character.isPrivate}
                                    isCreate
                                    compact={false}
                                    parameterKey={key}
                                    numberParameter={value}
                                    numberMaxParameter={maxValue}
                                    createdByMe={createdByMe}
                                    onOperate={mapping => {
                                        updateCharacter(character => {
                                            if (character == null) {
                                                return;
                                            }
                                            return mapping(character);
                                        });
                                    }}
                                />
                            </Col>
                        </Row>
                    );
                })}
                {strIndex20Array.map(key => {
                    const paramName = boolParamNames.get(key);
                    if (paramName === undefined) {
                        return null;
                    }
                    const value = character.boolParams[key];
                    return (
                        <Row key={`boolParam${key}Row`} gutter={gutter} align='middle'>
                            <Col flex='auto' />
                            <Col flex={0}>{paramName.name}</Col>
                            <Col span={inputSpan}>
                                <BooleanParameterInput
                                    isCharacterPrivate={character.isPrivate}
                                    isCreate
                                    compact={false}
                                    parameterKey={key}
                                    parameter={value}
                                    createdByMe={createdByMe}
                                    onOperate={mapping => {
                                        updateCharacter(character => {
                                            if (character == null) {
                                                return;
                                            }
                                            return mapping(character);
                                        });
                                    }}
                                />
                            </Col>
                        </Row>
                    );
                })}
                {strIndex20Array.map(key => {
                    const paramName = strParamNames.get(key);
                    if (paramName === undefined) {
                        return null;
                    }
                    const value = character.strParams[key];
                    return (
                        <Row key={`strParam${key}Row`} gutter={gutter} align='middle'>
                            <Col flex='auto' />
                            <Col flex={0}>{paramName.name}</Col>
                            <Col span={inputSpan}>
                                <StringParameterInput
                                    compact={false}
                                    isCharacterPrivate={character.isPrivate}
                                    isCreate
                                    parameterKey={key}
                                    parameter={value}
                                    createdByMe={createdByMe}
                                    onOperate={mapping => {
                                        updateCharacter(character => {
                                            if (character == null) {
                                                return;
                                            }
                                            return mapping(character);
                                        });
                                    }}
                                />
                            </Col>
                        </Row>
                    );
                })}

                <Typography.Title level={4}>メモ</Typography.Title>

                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}></Col>
                    <Col span={inputSpan}>
                        <BufferedTextArea
                            size='small'
                            bufferDuration='default'
                            value={character.memo}
                            rows={8}
                            onChange={e =>
                                updateCharacter(character => {
                                    if (character == null) {
                                        return;
                                    }
                                    character.memo = e.currentValue;
                                })
                            }
                        />
                    </Col>
                </Row>

                {createdByMe && (
                    <>
                        <Typography.Title level={4}>変数</Typography.Title>

                        <Row gutter={gutter} align='middle'>
                            <Col flex='auto' />
                            <Col flex={0}></Col>
                            <Col span={inputSpan}>
                                <CharacterVarInput
                                    character={character}
                                    rows={8}
                                    onChange={newValue => 
                                        updateCharacter(character => {
                                            if (character == null) {
                                                return;
                                            }
                                            character.privateVarToml = newValue;
                                        })
                                    }
                                />
                            </Col>
                        </Row>
                    </>
                )}

                {createdByMe && atomValue?.type === update && (
                    <>
                        <Typography.Title level={4}>コマンド</Typography.Title>

                        <Row gutter={gutter} align='middle'>
                            <Col flex='auto' />
                            <Col flex={0}></Col>
                            <Col span={inputSpan}>
                                <Button
                                    onClick={() =>
                                        setCommandEditorModal({
                                            characterId: atomValue.stateId,
                                        })
                                    }
                                >
                                    編集
                                </Button>
                            </Col>
                        </Row>
                    </>
                )}
            </div>

            <FilesManagerDrawer
                drawerType={filesManagerDrawerType}
                onClose={() => setFilesManagerDrawerType(null)}
            />
        </Modal>
    );
};
