import { Button, Checkbox, Col, Drawer, InputNumber, Row, Space, Tooltip, Typography } from 'antd';
import React from 'react';
import { DrawerFooter } from '../../layouts/DrawerFooter';
import { DrawerProps } from 'antd/lib/drawer';
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
import { TomlInput } from '../../components/Tomllnput';
import { useCharacters } from '../../hooks/state/useCharacters';
import { useParticipants } from '../../hooks/state/useParticipants';
import {
    useBoolParamNames,
    useNumParamNames,
    useStrParamNames,
} from '../../hooks/state/useParamNames';
import {
    CharacterState,
    PieceState,
    strIndex20Array,
    simpleId,
    BoardPositionState,
} from '@flocon-trpg/core';
import { useMyUserUid } from '../../hooks/useMyUserUid';
import { BufferedTextArea } from '../../components/BufferedTextArea';
import { FilePath } from '../../utils/filePath';
import { useSetRoomStateWithImmer } from '../../hooks/useSetRoomStateWithImmer';
import { useAtom } from 'jotai';
import { characterEditorDrawerAtom } from '../../atoms/overlay/characterEditorDrawerAtom';
import { create, update } from '../../utils/constants';
import { useUpdateAtom } from 'jotai/utils';
import { commandEditorModalAtom } from '../../atoms/overlay/commandEditorModalAtom';
import { useIsMyCharacter } from '../../hooks/state/useIsMyCharacter';
import { CharacterVarInput } from '../../components/CharacterVarInput';

const drawerBaseProps: Partial<DrawerProps> = {
    width: 600,
};

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

export const CharacterDrawer: React.FC = () => {
    const myUserUid = useMyUserUid();
    const [drawerType, setDrawerType] = useAtom(characterEditorDrawerAtom);
    const setCommandEditorModal = useUpdateAtom(commandEditorModalAtom);
    const setRoomState = useSetRoomStateWithImmer();
    const isMyCharacter = useIsMyCharacter();
    const characters = useCharacters();
    const boolParamNames = useBoolParamNames();
    const numParamNames = useNumParamNames();
    const strParamNames = useStrParamNames();
    const participants = useParticipants();
    let stateEditorParams: StateEditorParams<CharacterState | undefined>;
    switch (drawerType?.type) {
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
                state: characters?.get(drawerType.stateId),
                onUpdate: nextState => {
                    setRoomState(roomState => {
                        roomState.characters[drawerType.stateId] = nextState;
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
        if (drawerType?.type !== update) {
            return true;
        }
        return isMyCharacter(drawerType.stateId);
    })();

    const piece = (() => {
        if (drawerType?.type !== update || drawerType.boardId == null) {
            return null;
        }
        return character.pieces[drawerType.boardId] ?? null;
    })();

    const updatePiece = (recipe: (piece: PieceState) => void) => {
        if (drawerType?.type !== update || drawerType.boardId == null) {
            return;
        }
        const boardId = drawerType.boardId;
        updateCharacter(character => {
            const piece = character?.pieces?.[boardId];
            if (piece == null) {
                return;
            }
            recipe(piece);
        });
    };

    const portraitPosition = (() => {
        if (drawerType?.type !== update || drawerType.boardId == null) {
            return null;
        }
        return character.portraitPositions[drawerType.boardId] ?? null;
    })();

    const updatePortraitPosition = (recipe: (position: BoardPositionState) => void) => {
        if (drawerType?.type !== update || drawerType.boardId == null) {
            return;
        }
        const boardId = drawerType.boardId;
        updateCharacter(character => {
            const position = character?.portraitPositions?.[boardId];
            if (position == null) {
                return;
            }
            recipe(position);
        });
    };

    let onOkClick: (() => void) | undefined = undefined;
    if (drawerType?.type === create) {
        onOkClick = () => {
            const id = simpleId();
            setRoomState(roomState => {
                roomState.characters[id] = {
                    ...character,
                    ownerParticipantId: myUserUid,
                };
            });
            resetCharacterToCreate();
            setDrawerType(null);
        };
    }

    let onDestroy: (() => void) | undefined = undefined;
    if (drawerType?.type === update) {
        onDestroy = () => {
            setRoomState(roomState => {
                delete roomState.characters[drawerType.stateId];
            });
            setDrawerType(null);
        };
    }

    const pieceElement = (() => {
        if (piece == null) {
            return null;
        }
        return (
            <>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}></Col>
                    <Col span={inputSpan}>
                        <Checkbox
                            checked={piece.isPrivate}
                            onChange={e =>
                                updatePiece(piece => {
                                    piece.isPrivate = e.target.checked;
                                })
                            }
                        >
                            コマを非公開にする
                        </Checkbox>
                    </Col>
                </Row>

                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}></Col>
                    <Col span={inputSpan}>
                        <Checkbox
                            checked={piece.isCellMode}
                            onChange={e =>
                                updatePiece(piece => {
                                    piece.isCellMode = e.target.checked;
                                })
                            }
                        >
                            セルにスナップする
                        </Checkbox>
                    </Col>
                </Row>

                {piece.isCellMode ? (
                    <>
                        <Row gutter={gutter} align='middle'>
                            <Col flex='auto' />
                            <Col flex={0}>位置</Col>
                            <Col span={inputSpan}>
                                <Space>
                                    <InputNumber
                                        value={piece.cellX}
                                        onChange={newValue =>
                                            typeof newValue === 'number'
                                                ? updatePiece(piece => {
                                                      piece.cellX = newValue;
                                                  })
                                                : undefined
                                        }
                                    />
                                    <span>*</span>
                                    <InputNumber
                                        value={piece.cellY}
                                        onChange={newValue =>
                                            typeof newValue === 'number'
                                                ? updatePiece(piece => {
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
                            <Col flex={0}>大きさ</Col>
                            <Col span={inputSpan}>
                                <Space>
                                    <InputNumber
                                        value={piece.cellW}
                                        onChange={newValue =>
                                            typeof newValue === 'number'
                                                ? updatePiece(piece => {
                                                      piece.cellW = newValue;
                                                  })
                                                : undefined
                                        }
                                    />
                                    <span>*</span>
                                    <InputNumber
                                        value={piece.cellH}
                                        onChange={newValue =>
                                            typeof newValue === 'number'
                                                ? updatePiece(piece => {
                                                      piece.cellH = newValue;
                                                  })
                                                : undefined
                                        }
                                    />
                                </Space>
                            </Col>
                        </Row>
                    </>
                ) : (
                    <>
                        <Row gutter={gutter} align='middle'>
                            <Col flex='auto' />
                            <Col flex={0}>位置</Col>
                            <Col span={inputSpan}>
                                <Space>
                                    <InputNumber
                                        value={piece.x}
                                        onChange={newValue =>
                                            typeof newValue === 'number'
                                                ? updatePiece(piece => {
                                                      piece.x = newValue;
                                                  })
                                                : undefined
                                        }
                                    />
                                    <span>*</span>
                                    <InputNumber
                                        value={piece.y}
                                        onChange={newValue =>
                                            typeof newValue === 'number'
                                                ? updatePiece(piece => {
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
                                        value={piece.w}
                                        onChange={newValue =>
                                            typeof newValue === 'number'
                                                ? updatePiece(piece => {
                                                      piece.w = newValue;
                                                  })
                                                : undefined
                                        }
                                    />
                                    <span>*</span>
                                    <InputNumber
                                        value={piece.h}
                                        onChange={newValue =>
                                            typeof newValue === 'number'
                                                ? updatePiece(piece => {
                                                      piece.h = newValue;
                                                  })
                                                : undefined
                                        }
                                    />
                                </Space>
                            </Col>
                        </Row>
                    </>
                )}
            </>
        );
    })();

    const portraitPositionElement = (() => {
        if (portraitPosition == null) {
            return null;
        }
        return (
            <>
                {
                    <>
                        <Row gutter={gutter} align='middle'>
                            <Col flex='auto' />
                            <Col flex={0}>位置</Col>
                            <Col span={inputSpan}>
                                <Space>
                                    <InputNumber
                                        value={portraitPosition.x}
                                        onChange={newValue =>
                                            typeof newValue === 'number'
                                                ? updatePortraitPosition(pos => {
                                                      pos.x = newValue;
                                                  })
                                                : undefined
                                        }
                                    />
                                    <span>*</span>
                                    <InputNumber
                                        value={portraitPosition.y}
                                        onChange={newValue =>
                                            typeof newValue === 'number'
                                                ? updatePortraitPosition(pos => {
                                                      pos.y = newValue;
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
                                        value={portraitPosition.w}
                                        onChange={newValue =>
                                            typeof newValue === 'number'
                                                ? updatePortraitPosition(pos => {
                                                      pos.w = newValue;
                                                  })
                                                : undefined
                                        }
                                    />
                                    <span>*</span>
                                    <InputNumber
                                        value={portraitPosition.h}
                                        onChange={newValue =>
                                            typeof newValue === 'number'
                                                ? updatePortraitPosition(pos => {
                                                      pos.h = newValue;
                                                  })
                                                : undefined
                                        }
                                    />
                                </Space>
                            </Col>
                        </Row>
                    </>
                }
            </>
        );
    })();

    return (
        <Drawer
            {...drawerBaseProps}
            title={drawerType?.type === create ? 'キャラクターの新規作成' : 'キャラクターの編集'}
            visible={drawerType != null}
            closable
            onClose={() => setDrawerType(null)}
            footer={
                <DrawerFooter
                    close={{
                        textType: drawerType?.type === create ? 'cancel' : 'close',
                        onClick: () => setDrawerType(null),
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
                {drawerType?.type === update && (
                    <>
                        <Typography.Title level={4}>作成者</Typography.Title>
                        <Row gutter={gutter} align='middle'>
                            <Col flex='auto' />
                            <Col flex={0}>作成者</Col>
                            <Col span={inputSpan}>
                                <span>{participants.get(drawerType.stateId)?.name}</span>
                                {createdByMe && (
                                    <span style={{ paddingLeft: 2, fontWeight: 'bold' }}>
                                        (自分)
                                    </span>
                                )}
                            </Col>
                        </Row>
                    </>
                )}

                {drawerType?.type !== update ? null : (
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

                {pieceElement != null && <Typography.Title level={4}>コマ</Typography.Title>}

                {pieceElement}

                <Typography.Title level={4}>全体公開</Typography.Title>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>全体公開</Col>
                    <Col span={inputSpan}>
                        <ToggleButton
                            size='small'
                            disabled={
                                createdByMe || drawerType?.type === create
                                    ? false
                                    : characterIsNotPrivateAndNotCreatedByMe
                            }
                            showAsTextWhenDisabled
                            checked={!character.isPrivate}
                            checkedChildren={<EyeOutlined />}
                            unCheckedChildren={<EyeInvisibleOutlined />}
                            tooltip={
                                character.isPrivate
                                    ? characterIsPrivate({ isCreate: drawerType?.type === create })
                                    : characterIsNotPrivate({
                                          isCreate: drawerType?.type === create,
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

                {portraitPositionElement == null ? null : (
                    <>
                        <Typography.Title level={4}>立ち絵</Typography.Title>
                    </>
                )}

                {portraitPositionElement}

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

                {createdByMe && drawerType?.type === update && (
                    <>
                        <Typography.Title level={4}>コマンド</Typography.Title>

                        <Row gutter={gutter} align='middle'>
                            <Col flex='auto' />
                            <Col flex={0}></Col>
                            <Col span={inputSpan}>
                                <Button
                                    onClick={() =>
                                        setCommandEditorModal({
                                            characterId: drawerType.stateId,
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
        </Drawer>
    );
};
