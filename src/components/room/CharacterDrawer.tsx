import { Button, Checkbox, Col, Divider, Drawer, Form, Input, InputNumber, PageHeader, Row, Space, Tooltip } from 'antd';
import React from 'react';
import DrawerFooter from '../../layouts/DrawerFooter';
import ComponentsStateContext from './contexts/RoomComponentsStateContext';
import DispatchRoomComponentsStateContext from './contexts/DispatchRoomComponentsStateContext';
import OperateContext from './contexts/OperateContext';
import { simpleId } from '../../utils/generators';
import { OperationElement, replace } from '../../stateManagers/states/types';
import { CompositeKey, createStateMap, StateMap } from '../../@shared/StateMap';
import { characterDrawerType, create, update } from './RoomComponentsState';
import { DrawerProps } from 'antd/lib/drawer';
import InputFile from '../InputFile';
import { FilesManagerDrawerType } from '../../utils/types';
import FilesManagerDrawer from '../FilesManagerDrawer';
import { Gutter } from 'antd/lib/grid/row';
import { strIndex20Array } from '../../@shared/indexes';
import { RoomParameterNameType } from '../../generated/graphql';
import MyAuthContext from '../../contexts/MyAuthContext';
import NumberParameterInput from '../../foundations/NumberParameterInput';
import BooleanParameterInput from '../../foundations/BooleanParameterInput';
import StringParameterInput from '../../foundations/StringParameterInput';
import ToggleButton from '../../foundations/ToggleButton';
import { SettingOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { characterIsPrivate, characterIsNotPrivate, characterIsNotPrivateAndNotCreatedByMe } from '../../resource/text/main';
import { Room } from '../../stateManagers/states/room';
import { Character } from '../../stateManagers/states/character';
import { Piece } from '../../stateManagers/states/piece';
import { getUserUid } from '../../hooks/useFirebaseUser';
import { useStateEditor } from '../../hooks/useStateEditor';
import { BoardLocation } from '../../stateManagers/states/boardLocation';

const notFound = 'notFound';

const drawerBaseProps: Partial<DrawerProps> = {
    width: 600,
};

type Props = {
    roomState: Room.State;
}

const defaultCharacter: Character.State = {
    name: '',
    isPrivate: false,
    pieces: createStateMap(),
    tachieLocations: createStateMap(),
    boolParams: new Map(),
    numParams: new Map(),
    numMaxParams: new Map(),
    strParams: new Map(),
};

const defaultPieceLocation: Piece.State = {
    x: 0,
    y: 0,
    w: 50,
    h: 50,
    cellX: 0,
    cellY: 0,
    cellW: 1,
    cellH: 1,
    isPrivate: false,
    isCellMode: true,
};

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

const CharacterDrawer: React.FC<Props> = ({ roomState }: Props) => {
    const myAuth = React.useContext(MyAuthContext);
    const componentsState = React.useContext(ComponentsStateContext);
    const drawerType = componentsState.characterDrawerType;
    const dispatch = React.useContext(DispatchRoomComponentsStateContext);
    const operate = React.useContext(OperateContext);
    const { state: character, setState: setCharacter, stateToCreate: characterToCreate, resetStateToCreate: resetCharacterToCreate } = useStateEditor(drawerType?.type === update ? roomState.characters.get(drawerType.stateKey) : undefined, defaultCharacter, ({ prevState, nextState }) => {
        if (drawerType?.type !== update) {
            return;
        }
        const diffOperation = Character.diff({ prev: prevState, next: nextState });
        const operation = Room.createPostOperationSetup();
        operation.characters.set(drawerType.stateKey, { type: update, operation: diffOperation });
        operate(operation);
    });
    const [filesManagerDrawerType, setFilesManagerDrawerType] = React.useState<FilesManagerDrawerType | null>(null);

    const createdByMe = (() => {
        if (drawerType?.type !== update) {
            return true;
        }
        return drawerType.stateKey.createdBy === getUserUid(myAuth);
    })();

    const piece = (() => {
        if (drawerType?.type !== update || drawerType.boardKey == null) {
            return null;
        }
        return character.pieces.get(drawerType.boardKey) ?? null;
    })();

    const tachieLocation = (() => {
        if (drawerType?.type !== update || drawerType.boardKey == null) {
            return null;
        }
        return character.tachieLocations.get(drawerType.boardKey) ?? null;
    })();

    const updateCharacter = (partialState: Partial<Character.State>) => {
        switch (drawerType?.type) {
            case create:
                setCharacter({ ...character, ...partialState });
                return;
            case update: {
                const diffOperation = Character.diff({ prev: character, next: { ...character, ...partialState } });
                const operation = Room.createPostOperationSetup();
                operation.characters.set(drawerType.stateKey, { type: update, operation: diffOperation });
                operate(operation);
                return;
            }
        }
    };
    const updateCharacterByOperation = (operation: Character.PostOperation) => {
        switch (drawerType?.type) {
            case create: {
                const newCharacter = Character.applyOperation({ state: character, operation });
                setCharacter(newCharacter);
                return;
            }
            case update: {
                const roomOperation = Room.createPostOperationSetup();
                roomOperation.characters.set(drawerType.stateKey, { type: update, operation });
                operate(roomOperation);
                return;
            }
        }
    };

    const updatePiece = (partialState: Partial<Piece.State>) => {
        if (piece == null || drawerType?.type !== update || drawerType.boardKey == null) {
            return;
        }
        const diffOperation = Piece.diff({ prev: piece, next: { ...piece, ...partialState } });
        const pieces = createStateMap<OperationElement<Piece.State, Piece.PostOperation>>();
        pieces.set(drawerType.boardKey, {
            type: update,
            operation: diffOperation,
        });
        const operation = Room.createPostOperationSetup();
        operation.characters.set(drawerType.stateKey, {
            type: update,
            operation: {
                pieces,
                tachieLocations: createStateMap(),
                boolParams: new Map(),
                numParams: new Map(),
                numMaxParams: new Map(),
                strParams: new Map(),
            }
        });
        operate(operation);
    };

    const updateTachieLocation = (partialState: Partial<BoardLocation.State>) => {
        if (tachieLocation == null || drawerType?.type !== update || drawerType.boardKey == null) {
            return;
        }
        const diffOperation = BoardLocation.diff({ prev: tachieLocation, next: { ...tachieLocation, ...partialState } });
        const tachieLocations = createStateMap<OperationElement<BoardLocation.State, BoardLocation.PostOperation>>();
        tachieLocations.set(drawerType.boardKey, {
            type: update,
            operation: diffOperation,
        });
        const operation = Room.createPostOperationSetup();
        operation.characters.set(drawerType.stateKey, {
            type: update,
            operation: {
                tachieLocations,
                pieces: createStateMap(),
                boolParams: new Map(),
                numParams: new Map(),
                numMaxParams: new Map(),
                strParams: new Map(),
            }
        });
        operate(operation);
    };

    let onOkClick: (() => void) | undefined = undefined;
    if (drawerType?.type === create) {
        onOkClick = () => {
            if (characterToCreate == null) {
                return;
            }
            const id = simpleId();
            const operation = Room.createPostOperationSetup();
            operation.addCharacters.set(id, characterToCreate);
            operate(operation);
            resetCharacterToCreate();
            dispatch({ type: characterDrawerType, newValue: null });
        };
    }

    let onDestroy: (() => void) | undefined = undefined;
    if (drawerType?.type === update) {
        onDestroy = () => {
            const operation = Room.createPostOperationSetup();
            operation.characters.set(drawerType.stateKey, { type: replace, newValue: undefined });
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

                {pieceElement == null ? null : <>
                    <Divider />
                    <PageHeader
                        title="コマ" />
                </>}

                {pieceElement}

                {tachieLocationElement == null ? null : <>
                    <Divider />
                    <PageHeader
                        title="立ち絵" />
                </>}

                {tachieLocationElement}

                <Divider />

                {characterToCreate != null ? null :
                    <>
                        <PageHeader
                            title="複製" />

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
                                        const operation = Room.createPostOperationSetup();
                                        operation.addCharacters.set(id, {
                                            ...character,
                                            name: `${character.name} (複製)`,
                                            pieces: createStateMap(),
                                        });
                                        operate(operation);
                                    }} >
                                        このキャラクターを複製
                                    </Button>
                                </Tooltip>
                            </Col>
                        </Row>
                    </>
                }

                <PageHeader
                    title="パラメーター" />

                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>名前</Col>
                    <Col span={inputSpan}>
                        <Input size='small' value={character.name} onChange={e => updateCharacter({ name: e.target.value })} />
                    </Col>
                </Row>

                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>アイコン画像</Col>
                    <Col span={inputSpan}>
                        <InputFile filePath={character.image ?? undefined} onPathChange={path => updateCharacter({ image: path ?? undefined })} openFilesManager={setFilesManagerDrawerType} showImage />
                    </Col>
                </Row>

                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>立ち絵画像</Col>
                    <Col span={inputSpan}>
                        <InputFile filePath={character.tachieImage ?? undefined} onPathChange={path => updateCharacter({ tachieImage: path ?? undefined })} openFilesManager={setFilesManagerDrawerType} showImage />
                    </Col>
                </Row>

                {
                    strIndex20Array.map(key => {
                        const paramName = roomState.paramNames.get({ type: RoomParameterNameType.Num, key });
                        if (paramName === undefined) {
                            return null;
                        }
                        const value = character.numParams.get(key);
                        const maxValue = character.numMaxParams.get(key);
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
                        const paramName = roomState.paramNames.get({ type: RoomParameterNameType.Bool, key });
                        if (paramName === undefined) {
                            return null;
                        }
                        const value = character.boolParams.get(key);
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
                        const paramName = roomState.paramNames.get({ type: RoomParameterNameType.Str, key });
                        if (paramName === undefined) {
                            return null;
                        }
                        const value = character.strParams.get(key);
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
            </div>
            <FilesManagerDrawer drawerType={filesManagerDrawerType} onClose={() => setFilesManagerDrawerType(null)} />
        </Drawer>
    );
};

export default CharacterDrawer;