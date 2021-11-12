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
import { useSetRoomStateByApply } from '../../hooks/useSetRoomStateByApply';
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
    applyCharacter,
    boardLocationDiff,
    BoardLocationState,
    characterDiff,
    CharacterState,
    CharacterUpOperation,
    PieceState,
    toCharacterUpOperation,
    pieceDiff,
    strIndex20Array,
    simpleId,
} from '@flocon-trpg/core';
import { useSelector } from '../../store';
import { useDispatch } from 'react-redux';
import {
    characterCommand,
    create,
    roomDrawerAndPopoverAndModalModule,
    update,
} from '../../modules/roomDrawerAndPopoverAndModalModule';
import { useMyUserUid } from '../../hooks/useMyUserUid';
import { BufferedTextArea } from '../../components/BufferedTextArea';
import { FilePath } from '../../utils/filePath';
import { characterUpdateOperation } from '../../utils/characterUpdateOperation';
import { characterReplaceOperation } from '../../utils/characterReplaceOperation';
import { useSetRoomStateWithImmer } from '../../hooks/useSetRoomStateWithImmer';
import produce from 'immer';

const notFound = 'notFound';

const drawerBaseProps: Partial<DrawerProps> = {
    width: 600,
};

const defaultCharacter: CharacterState = {
    $v: 1,
    $r: 2,
    chatPalette: '',
    memo: '',
    name: '',
    isPrivate: false,
    image: null,
    privateCommand: '',
    privateCommands: {},
    privateVarToml: '',
    tachieImage: null,
    tachieLocations: {},
    boolParams: {},
    numParams: {},
    numMaxParams: {},
    strParams: {},
    pieces: {},
    dicePieceValues: {},
    stringPieceValues: {},
};

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

export const CharacterDrawer: React.FC = () => {
    const myUserUid = useMyUserUid();
    const drawerType = useSelector(
        state => state.roomDrawerAndPopoverAndModalModule.characterDrawerType
    );
    const dispatch = useDispatch();
    const operate = useSetRoomStateByApply();
    const operateAsStateWithImmer = useSetRoomStateWithImmer();
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
                state: characters?.get(drawerType.stateKey),
                onUpdate: ({ prevState, nextState }) => {
                    if (prevState == null || nextState == null) {
                        return;
                    }
                    const diffOperation = characterDiff({ prevState, nextState });
                    if (diffOperation == null) {
                        return;
                    }
                    operate(
                        characterUpdateOperation(
                            drawerType.stateKey,
                            toCharacterUpOperation(diffOperation)
                        )
                    );
                },
            };
            break;
    }
    const {
        uiState: character,
        updateUiState: setCharacter,
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
        return drawerType.stateKey.createdBy === myUserUid;
    })();

    const piece = (() => {
        if (drawerType?.type !== update || drawerType.boardKey == null) {
            return null;
        }
        return character.pieces[drawerType.boardKey.createdBy]?.[drawerType.boardKey.id] ?? null;
    })();

    const tachieLocation = (() => {
        if (drawerType?.type !== update || drawerType.boardKey == null) {
            return null;
        }
        return (
            character.tachieLocations[drawerType.boardKey.createdBy]?.[drawerType.boardKey.id] ??
            null
        );
    })();

    const updateCharacterByImmer = (recipe: (state: CharacterState) => void) => {
        switch (drawerType?.type) {
            case create: {
                const newCharacter = produce(character, recipe);
                setCharacter(newCharacter);
                return;
            }
            case update: {
                operateAsStateWithImmer(prevRoom => {
                        const character =
                            prevRoom.participants[drawerType.stateKey.createdBy]?.characters?.[
                                drawerType.stateKey.id
                            ];
                        if (character == null) {
                            return;
                        }
                        recipe(character);
                });
                return;
            }
        }
    };
    const updateCharacterByOperation = (operation: CharacterUpOperation) => {
        switch (drawerType?.type) {
            case create: {
                const newCharacter = applyCharacter({ state: character, operation });
                if (newCharacter.isError) {
                    throw newCharacter.error;
                }
                setCharacter(newCharacter.value);
                return;
            }
            case update: {
                operate(characterUpdateOperation(drawerType.stateKey, operation));
                return;
            }
        }
    };

    const updatePiece = (partialState: Partial<PieceState>) => {
        if (piece == null || drawerType?.type !== update || drawerType.boardKey == null) {
            return;
        }
        const diffOperation = pieceDiff({
            prevState: piece,
            nextState: { ...piece, ...partialState },
        });
        if (diffOperation == null) {
            return;
        }
        operate(
            characterUpdateOperation(drawerType.stateKey, {
                $v: 1,
                $r: 2,
                pieces: {
                    [drawerType.boardKey.createdBy]: {
                        [drawerType.boardKey.id]: {
                            type: update,
                            update: diffOperation,
                        },
                    },
                },
            })
        );
    };

    const updateTachieLocation = (partialState: Partial<BoardLocationState>) => {
        if (tachieLocation == null || drawerType?.type !== update || drawerType.boardKey == null) {
            return;
        }
        const diffOperation = boardLocationDiff({
            prevState: tachieLocation,
            nextState: { ...tachieLocation, ...partialState },
        });
        if (diffOperation == null) {
            return;
        }
        operate(
            characterUpdateOperation(drawerType.stateKey, {
                $v: 1,
                $r: 2,
                tachieLocations: {
                    [drawerType.boardKey.createdBy]: {
                        [drawerType.boardKey.id]: {
                            type: update,
                            update: diffOperation,
                        },
                    },
                },
            })
        );
    };

    let onOkClick: (() => void) | undefined = undefined;
    if (drawerType?.type === create) {
        onOkClick = () => {
            const id = simpleId();
            operate(characterReplaceOperation({ createdBy: myUserUid, id }, character));
            resetCharacterToCreate();
            dispatch(roomDrawerAndPopoverAndModalModule.actions.set({ characterDrawerType: null }));
        };
    }

    let onDestroy: (() => void) | undefined = undefined;
    if (drawerType?.type === update) {
        onDestroy = () => {
            operate(characterReplaceOperation(drawerType.stateKey, undefined));
            dispatch(roomDrawerAndPopoverAndModalModule.actions.set({ characterDrawerType: null }));
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
                            onChange={e => updatePiece({ isPrivate: e.target.checked })}
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
                            onChange={e => updatePiece({ isCellMode: e.target.checked })}
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
                                                ? updatePiece({ cellX: newValue })
                                                : undefined
                                        }
                                    />
                                    <span>*</span>
                                    <InputNumber
                                        value={piece.cellY}
                                        onChange={newValue =>
                                            typeof newValue === 'number'
                                                ? updatePiece({ cellY: newValue })
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
                                                ? updatePiece({ cellW: newValue })
                                                : undefined
                                        }
                                    />
                                    <span>*</span>
                                    <InputNumber
                                        value={piece.cellH}
                                        onChange={newValue =>
                                            typeof newValue === 'number'
                                                ? updatePiece({ cellH: newValue })
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
                                                ? updatePiece({ x: newValue })
                                                : undefined
                                        }
                                    />
                                    <span>*</span>
                                    <InputNumber
                                        value={piece.y}
                                        onChange={newValue =>
                                            typeof newValue === 'number'
                                                ? updatePiece({ y: newValue })
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
                                                ? updatePiece({ w: newValue })
                                                : undefined
                                        }
                                    />
                                    <span>*</span>
                                    <InputNumber
                                        value={piece.h}
                                        onChange={newValue =>
                                            typeof newValue === 'number'
                                                ? updatePiece({ h: newValue })
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

    const tachieLocationElement = (() => {
        if (tachieLocation == null) {
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
                                        value={tachieLocation.x}
                                        onChange={newValue =>
                                            typeof newValue === 'number'
                                                ? updateTachieLocation({ x: newValue })
                                                : undefined
                                        }
                                    />
                                    <span>*</span>
                                    <InputNumber
                                        value={tachieLocation.y}
                                        onChange={newValue =>
                                            typeof newValue === 'number'
                                                ? updateTachieLocation({ y: newValue })
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
                                        value={tachieLocation.w}
                                        onChange={newValue =>
                                            typeof newValue === 'number'
                                                ? updateTachieLocation({ w: newValue })
                                                : undefined
                                        }
                                    />
                                    <span>*</span>
                                    <InputNumber
                                        value={tachieLocation.h}
                                        onChange={newValue =>
                                            typeof newValue === 'number'
                                                ? updateTachieLocation({ h: newValue })
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
            onClose={() =>
                dispatch(
                    roomDrawerAndPopoverAndModalModule.actions.set({ characterDrawerType: null })
                )
            }
            footer={
                <DrawerFooter
                    close={{
                        textType: drawerType?.type === create ? 'cancel' : 'close',
                        onClick: () =>
                            dispatch(
                                roomDrawerAndPopoverAndModalModule.actions.set({
                                    characterDrawerType: null,
                                })
                            ),
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
                                <span>{participants.get(drawerType.stateKey.createdBy)?.name}</span>
                                {createdByMe && (
                                    <span style={{ paddingLeft: 2, fontWeight: 'bold' }}>
                                        (自分)
                                    </span>
                                )}
                            </Col>
                        </Row>
                    </>
                )}

                {character == null || drawerType?.type !== update ? null : (
                    <>
                        <Typography.Title level={4}>複製</Typography.Title>

                        <Row gutter={gutter} align='middle'>
                            <Col flex='auto' />
                            <Col flex={0}></Col>
                            <Col span={inputSpan}>
                                {/* TODO: 複製したことを何らかの形で通知したほうがいい */}
                                <Tooltip title='コマの情報を除き、このキャラクターを複製します。'>
                                    <Button
                                        size='small'
                                        onClick={() => {
                                            const id = simpleId();
                                            operate(
                                                characterReplaceOperation(
                                                    { createdBy: myUserUid, id },
                                                    {
                                                        ...character,
                                                        name: `${character.name} (複製)`,
                                                    }
                                                )
                                            );
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
                                updateCharacterByImmer(character => {
                                    character.isPrivate = !newValue;
                                })
                            }
                        />
                    </Col>
                </Row>

                {tachieLocationElement == null ? null : (
                    <>
                        <Typography.Title level={4}>立ち絵</Typography.Title>
                    </>
                )}

                {tachieLocationElement}

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
                                updateCharacterByImmer(character => {
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
                                updateCharacterByImmer(character => {
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
                            filePath={character.tachieImage ?? undefined}
                            onPathChange={path =>
                                updateCharacterByImmer(character => {
                                    character.tachieImage =
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
                                    onOperate={operation => {
                                        updateCharacterByOperation(operation);
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
                                    onOperate={operation => {
                                        updateCharacterByOperation(operation);
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
                                    onOperate={operation => {
                                        updateCharacterByOperation(operation);
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
                                updateCharacterByImmer(character => {
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
                                <TomlInput
                                    size='small'
                                    bufferDuration='default'
                                    value={character.privateVarToml}
                                    rows={8}
                                    onChange={e =>
                                        updateCharacterByImmer(character => {
                                            character.privateVarToml = e.currentValue;
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
                                        dispatch(
                                            roomDrawerAndPopoverAndModalModule.actions.set({
                                                commandEditorModalType: {
                                                    type: characterCommand,
                                                    characterKey: drawerType.stateKey,
                                                },
                                            })
                                        )
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
