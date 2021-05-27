import { Button, Checkbox, Col, Drawer, InputNumber, Row, Space, Tooltip, Typography } from 'antd';
import React from 'react';
import DrawerFooter from '../../layouts/DrawerFooter';
import ComponentsStateContext from './contexts/RoomComponentsStateContext';
import DispatchRoomComponentsStateContext from './contexts/DispatchRoomComponentsStateContext';
import { simpleId } from '../../utils/generators';
import { replace } from '../../stateManagers/states/types';
import { characterDrawerType, create, update } from './RoomComponentsState';
import { DrawerProps } from 'antd/lib/drawer';
import InputFile from '../InputFile';
import { FilePath, FilesManagerDrawerType } from '../../utils/types';
import FilesManagerDrawer from '../FilesManagerDrawer';
import { Gutter } from 'antd/lib/grid/row';
import NumberParameterInput from '../../foundations/NumberParameterInput';
import BooleanParameterInput from '../../foundations/BooleanParameterInput';
import StringParameterInput from '../../foundations/StringParameterInput';
import ToggleButton from '../../foundations/ToggleButton';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { characterIsPrivate, characterIsNotPrivate, characterIsNotPrivateAndNotCreatedByMe } from '../../resource/text/main';
import { useStateEditor } from '../../hooks/useStateEditor';
import { useOperate } from '../../hooks/useOperate';
import BufferedInput from '../../foundations/BufferedInput';
import BufferedTextArea from '../../foundations/BufferedTextArea';
import { characterCommand, characterVariable, TomlInput } from '../../foundations/Tomllnput';
import { useCharacters } from '../../hooks/state/useCharacters';
import { useParticipants } from '../../hooks/state/useParticipants';
import { useBoolParamNames, useNumParamNames, useStrParamNames } from '../../hooks/state/useParamNames';
import { useMe } from '../../hooks/useMe';
import { applyCharacter, boardLocationDiff, BoardLocationState, characterDiff, CharacterState, CharacterUpOperation, PieceState, toCharacterUpOperation, UpOperation, pieceDiff } from '@kizahasi/flocon-core';
import { dualKeyRecordFind, strIndex20Array } from '@kizahasi/util';

const notFound = 'notFound';

const drawerBaseProps: Partial<DrawerProps> = {
    width: 600,
};

const defaultCharacter: CharacterState = {
    $version: 1,
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
};

const defaultPieceLocation: PieceState = {
    $version: 1,
    x: 0,
    y: 0,
    w: 50,
    h: 50,
    cellX: 0,
    cellY: 0,
    cellW: 1,
    cellH: 1,
    isCellMode: true,
    isPrivate: true,
};

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

const CharacterDrawer: React.FC = () => {
    const me = useMe();
    const componentsState = React.useContext(ComponentsStateContext);
    const drawerType = componentsState.characterDrawerType;
    const dispatch = React.useContext(DispatchRoomComponentsStateContext);
    const operate = useOperate();
    const characters = useCharacters();
    const boolParamNames = useBoolParamNames();
    const numParamNames = useNumParamNames();
    const strParamNames = useStrParamNames();
    const participants = useParticipants();
    const { state: character, setState: setCharacter, stateToCreate: characterToCreate, resetStateToCreate: resetCharacterToCreate } = useStateEditor(drawerType?.type === update ? characters?.get(drawerType.stateKey) : undefined, defaultCharacter, ({ prevState, nextState }) => {
        if (drawerType?.type !== update) {
            return;
        }
        const diffOperation = characterDiff({ prevState, nextState });
        if (diffOperation == null) {
            return;
        }
        const operation: UpOperation = {
            $version: 1,
            participants: {
                [drawerType.stateKey.createdBy]: {
                    type: update,
                    update: {
                        $version: 1,
                        characters: {
                            [drawerType.stateKey.id]: {
                                type: update,
                                update: toCharacterUpOperation(diffOperation),
                            }
                        }
                    }
                }
            }
        };
        operate(operation);
    });
    const [filesManagerDrawerType, setFilesManagerDrawerType] = React.useState<FilesManagerDrawerType | null>(null);


    if (boolParamNames == null || numParamNames == null || strParamNames == null || participants == null || me.userUid == null) {
        return null;
    }

    const createdByMe = (() => {
        if (drawerType?.type !== update) {
            return true;
        }
        return drawerType.stateKey.createdBy === me.userUid;
    })();

    const piece = (() => {
        if (drawerType?.type !== update || drawerType.boardKey == null) {
            return null;
        }
        return dualKeyRecordFind<PieceState>(character.pieces, { first: drawerType.boardKey.createdBy, second: drawerType.boardKey.id }) ?? null;
    })();

    const tachieLocation = (() => {
        if (drawerType?.type !== update || drawerType.boardKey == null) {
            return null;
        }
        return dualKeyRecordFind<BoardLocationState>(character.tachieLocations, { first: drawerType.boardKey.createdBy, second: drawerType.boardKey.id }) ?? null;
    })();

    const updateCharacter = (partialState: Partial<CharacterState>) => {
        switch (drawerType?.type) {
            case create:
                setCharacter({ ...character, ...partialState });
                return;
            case update: {
                const diffOperation = characterDiff({ prevState: character, nextState: { ...character, ...partialState } });
                if (diffOperation == null) {
                    return;
                }
                const operation: UpOperation = {
                    $version: 1,
                    participants: {
                        [drawerType.stateKey.createdBy]: {
                            type: update,
                            update: {
                                $version: 1,
                                characters: {
                                    [drawerType.stateKey.id]: {
                                        type: update,
                                        update: toCharacterUpOperation(diffOperation),
                                    }
                                }
                            }
                        }
                    }
                };
                operate(operation);
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
                const roomOperation: UpOperation = {
                    $version: 1,
                    participants: {
                        [drawerType.stateKey.createdBy]: {
                            type: update,
                            update: {
                                $version: 1,
                                characters: {
                                    [drawerType.stateKey.id]: {
                                        type: update,
                                        update: operation,
                                    }
                                }
                            }
                        }
                    }
                };
                operate(roomOperation);
                return;
            }
        }
    };

    const updatePiece = (partialState: Partial<PieceState>) => {
        if (piece == null || drawerType?.type !== update || drawerType.boardKey == null) {
            return;
        }
        const diffOperation = pieceDiff({ prevState: piece, nextState: { ...piece, ...partialState } });
        if (diffOperation == null) {
            return;
        }
        const operation: UpOperation = {
            $version: 1,
            participants: {
                [drawerType.stateKey.createdBy]: {
                    type: update,
                    update: {
                        $version: 1,
                        characters: {
                            [drawerType.stateKey.id]: {
                                type: update,
                                update: {
                                    $version: 1,
                                    pieces: {
                                        [drawerType.boardKey.createdBy]: {
                                            [drawerType.boardKey.id]: {
                                                type: update,
                                                update: diffOperation,
                                            }
                                        }
                                    }
                                },
                            }
                        }
                    }
                }
            }
        };
        operate(operation);
    };

    const updateTachieLocation = (partialState: Partial<BoardLocationState>) => {
        if (tachieLocation == null || drawerType?.type !== update || drawerType.boardKey == null) {
            return;
        }
        const diffOperation = boardLocationDiff({ prevState: tachieLocation, nextState: { ...tachieLocation, ...partialState } });
        if (diffOperation == null) {
            return;
        }
        const operation: UpOperation = {
            $version: 1,
            participants: {
                [drawerType.stateKey.createdBy]: {
                    type: update,
                    update: {
                        $version: 1,
                        characters: {
                            [drawerType.stateKey.id]: {
                                type: update,
                                update: {
                                    $version: 1,
                                    tachieLocations: {
                                        [drawerType.boardKey.createdBy]: {
                                            [drawerType.boardKey.id]: {
                                                type: update,
                                                update: diffOperation,
                                            }
                                        }
                                    }
                                },
                            }
                        }
                    }
                }
            }
        };
        operate(operation);
    };

    let onOkClick: (() => void) | undefined = undefined;
    if (drawerType?.type === create) {
        onOkClick = () => {
            if (characterToCreate == null) {
                return;
            }
            const id = simpleId();
            const operation: UpOperation = {
                $version: 1,
                participants: {
                    [me.userUid]: {
                        type: update,
                        update: {
                            $version: 1,
                            characters: {
                                [id]: {
                                    type: replace,
                                    replace: {
                                        newValue: characterToCreate,
                                    },
                                }
                            }
                        }
                    }
                }
            };
            operate(operation);
            resetCharacterToCreate();
            dispatch({ type: characterDrawerType, newValue: null });
        };
    }

    let onDestroy: (() => void) | undefined = undefined;
    if (drawerType?.type === update) {
        onDestroy = () => {
            const operation: UpOperation = {
                $version: 1,
                participants: {
                    [drawerType.stateKey.createdBy]: {
                        type: update,
                        update: {
                            $version: 1,
                            characters: {
                                [drawerType.stateKey.id]: {
                                    type: replace,
                                    replace: {
                                        newValue: undefined,
                                    },
                                }
                            }
                        }
                    }
                }
            };
            operate(operation);
            dispatch({ type: characterDrawerType, newValue: null });
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
                            onChange={e => updatePiece({ isPrivate: e.target.checked })}>
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
                            onChange={e => updatePiece({ isCellMode: e.target.checked })}>
                            セルにスナップする
                        </Checkbox>
                    </Col>
                </Row>

                {
                    piece.isCellMode ?
                        <>
                            <Row gutter={gutter} align='middle'>
                                <Col flex='auto' />
                                <Col flex={0}>位置</Col>
                                <Col span={inputSpan}>
                                    <Space>
                                        <InputNumber
                                            value={piece.cellX}
                                            onChange={newValue => typeof newValue === 'number' ? updatePiece({ cellX: newValue }) : undefined} />
                                        <span>*</span>
                                        <InputNumber
                                            value={piece.cellY}
                                            onChange={newValue => typeof newValue === 'number' ? updatePiece({ cellY: newValue }) : undefined} />
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
                                            onChange={newValue => typeof newValue === 'number' ? updatePiece({ cellW: newValue }) : undefined} />
                                        <span>*</span>
                                        <InputNumber
                                            value={piece.cellH}
                                            onChange={newValue => typeof newValue === 'number' ? updatePiece({ cellH: newValue }) : undefined} />
                                    </Space>
                                </Col>
                            </Row>
                        </> : <>
                            <Row gutter={gutter} align='middle'>
                                <Col flex='auto' />
                                <Col flex={0}>位置</Col>
                                <Col span={inputSpan}>
                                    <Space>
                                        <InputNumber
                                            value={piece.x}
                                            onChange={newValue => typeof newValue === 'number' ? updatePiece({ x: newValue }) : undefined} />
                                        <span>*</span>
                                        <InputNumber
                                            value={piece.y}
                                            onChange={newValue => typeof newValue === 'number' ? updatePiece({ y: newValue }) : undefined} />
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
                                            onChange={newValue => typeof newValue === 'number' ? updatePiece({ w: newValue }) : undefined} />
                                        <span>*</span>
                                        <InputNumber
                                            value={piece.h}
                                            onChange={newValue => typeof newValue === 'number' ? updatePiece({ h: newValue }) : undefined} />
                                    </Space>
                                </Col>
                            </Row>
                        </>
                }
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
                                        onChange={newValue => typeof newValue === 'number' ? updateTachieLocation({ x: newValue }) : undefined} />
                                    <span>*</span>
                                    <InputNumber
                                        value={tachieLocation.y}
                                        onChange={newValue => typeof newValue === 'number' ? updateTachieLocation({ y: newValue }) : undefined} />
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
                                        onChange={newValue => typeof newValue === 'number' ? updateTachieLocation({ w: newValue }) : undefined} />
                                    <span>*</span>
                                    <InputNumber
                                        value={tachieLocation.h}
                                        onChange={newValue => typeof newValue === 'number' ? updateTachieLocation({ h: newValue }) : undefined} />
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
            onClose={() => dispatch({ type: characterDrawerType, newValue: null })}
            footer={(
                <DrawerFooter
                    close={({
                        textType: drawerType?.type === create ? 'cancel' : 'close',
                        onClick: () => dispatch({ type: characterDrawerType, newValue: null })
                    })}
                    ok={onOkClick == null ? undefined : ({ textType: 'create', onClick: onOkClick })}
                    destroy={onDestroy == null ? undefined : {
                        modal: {
                            title: 'キャラクターの削除の確認',
                            content: `このキャラクター "${character.name}" を削除します。よろしいですか？`,
                        },
                        onClick: onDestroy,
                    }}
                />)}>
            <div>
                {drawerType?.type === update && <>
                    <Typography.Title level={4}>作成者</Typography.Title>
                    <Row gutter={gutter} align='middle'>
                        <Col flex='auto' />
                        <Col flex={0}>作成者</Col>
                        <Col span={inputSpan}>
                            <span>{participants.get(drawerType.stateKey.createdBy)?.name}</span>{createdByMe && <span style={{ paddingLeft: 2, fontWeight: 'bold' }}>(自分)</span>}
                        </Col>
                    </Row>
                </>}

                {characterToCreate != null ? null :
                    <>
                        <Typography.Title level={4}>複製</Typography.Title>

                        <Row gutter={gutter} align='middle'>
                            <Col flex='auto' />
                            <Col flex={0}></Col>
                            <Col span={inputSpan}>
                                {/* TODO: 複製したことを何らかの形で通知したほうがいい */}
                                <Tooltip title='コマの情報を除き、このキャラクターを複製します。'>
                                    <Button size='small' onClick={() => {
                                        if (characterToCreate != null) {
                                            return;
                                        }
                                        const id = simpleId();
                                        const operation: UpOperation = {
                                            $version: 1,
                                            participants: {
                                                [me.userUid]: {
                                                    type: update,
                                                    update: {
                                                        $version: 1,
                                                        characters: {
                                                            [id]: {
                                                                type: replace,
                                                                replace: {
                                                                    newValue: {
                                                                        ...character,
                                                                        name: `${character.name} (複製)`,
                                                                    },
                                                                },
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        };
                                        operate(operation);
                                    }} >
                                        このキャラクターを複製
                                    </Button>
                                </Tooltip>
                            </Col>
                        </Row>
                    </>
                }

                {pieceElement != null && <Typography.Title level={4}>コマ</Typography.Title>}

                {pieceElement}

                <Typography.Title level={4}>全体公開</Typography.Title>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>全体公開</Col>
                    <Col span={inputSpan}>
                        <ToggleButton
                            size='small'
                            disabled={(createdByMe || drawerType?.type === create) ? false : characterIsNotPrivateAndNotCreatedByMe}
                            showAsTextWhenDisabled
                            checked={!character.isPrivate}
                            checkedChildren={<EyeOutlined />}
                            unCheckedChildren={<EyeInvisibleOutlined />}
                            tooltip={character.isPrivate ? characterIsPrivate({ isCreate: drawerType?.type === create }) : characterIsNotPrivate({ isCreate: drawerType?.type === create })}
                            onChange={newValue => updateCharacter({ isPrivate: !newValue })} />
                    </Col>
                </Row>

                {tachieLocationElement == null ? null : <>
                    <Typography.Title level={4}>立ち絵</Typography.Title>
                </>}

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
                                updateCharacter({ name: e.currentValue });
                            }} />
                    </Col>
                </Row>

                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>アイコン画像</Col>
                    <Col span={inputSpan}>
                        <InputFile filePath={character.image ?? undefined} onPathChange={path => updateCharacter({ image: path == null ? undefined : FilePath.toOt(path) })} openFilesManager={setFilesManagerDrawerType} showImage />
                    </Col>
                </Row>

                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>立ち絵画像</Col>
                    <Col span={inputSpan}>
                        <InputFile filePath={character.tachieImage ?? undefined} onPathChange={path => updateCharacter({ tachieImage: path == null ? undefined : FilePath.toOt(path) })} openFilesManager={setFilesManagerDrawerType} showImage />
                    </Col>
                </Row>

                {
                    strIndex20Array.map(key => {
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
                                        }} />
                                </Col>
                            </Row>
                        );
                    })
                }
                {
                    strIndex20Array.map(key => {
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
                                        }} />
                                </Col>
                            </Row>
                        );
                    })
                }
                {
                    strIndex20Array.map(key => {
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
                                        }} />
                                </Col>
                            </Row>
                        );
                    })
                }

                <Typography.Title level={4}>メモ</Typography.Title>

                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}></Col>
                    <Col span={inputSpan}>
                        <BufferedTextArea size='small' bufferDuration='default' value={character.memo} rows={8} onChange={e => updateCharacter({ memo: e.currentValue })} />
                    </Col>
                </Row>

                {createdByMe &&
                    <>
                        <Typography.Title level={4}>変数</Typography.Title>

                        <Row gutter={gutter} align='middle'>
                            <Col flex='auto' />
                            <Col flex={0}></Col>
                            <Col span={inputSpan}>
                                <TomlInput tomlType={characterVariable} size='small' bufferDuration='default' value={character.privateVarToml} rows={8} onChange={e => updateCharacter({ privateVarToml: e.currentValue })} />
                            </Col>
                        </Row>
                    </>
                }

                {createdByMe &&
                    <>
                        <Typography.Title level={4}>コマンド</Typography.Title>

                        <Row gutter={gutter} align='middle'>
                            <Col flex='auto' />
                            <Col flex={0}></Col>
                            <Col span={inputSpan}>
                                <TomlInput tomlType={characterCommand} size='small' bufferDuration='default' value={character.privateCommand} rows={8} onChange={e => updateCharacter({ privateCommand: e.currentValue })} />
                            </Col>
                        </Row>
                    </>
                }
            </div>
            <FilesManagerDrawer drawerType={filesManagerDrawerType} onClose={() => setFilesManagerDrawerType(null)} />
        </Drawer>
    );
};

export default CharacterDrawer;