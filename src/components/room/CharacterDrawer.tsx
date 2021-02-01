import { Button, Checkbox, Col, Divider, Drawer, Form, Input, InputNumber, PageHeader, Row, Space } from 'antd';
import React from 'react';
import DrawerFooter from '../../layouts/DrawerFooter';
import * as Room from '../../stateManagers/states/room';
import * as Character from '../../stateManagers/states/character';
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
import * as PieceLocation from '../../stateManagers/states/pieceLocation';
import { strIndex20Array } from '../../@shared/indexes';
import { RoomParameterNameType } from '../../generated/graphql';
import MyAuthContext from '../../contexts/MyAuthContext';
import NumberParameterInput from '../../foundations/NumberParameterInput';
import BooleanParameterInput from '../../foundations/BooleanParameterInput';
import StringParameterInput from '../../foundations/StringParameterInput';

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
    pieceLocations: createStateMap(),
    boolParams: new Map(),
    numParams: new Map(),
    numMaxParams: new Map(),
    strParams: new Map(),
};

const defaultPieceLocation: PieceLocation.State = {
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
const inputSpan = 18;

const CharacterDrawer: React.FC<Props> = ({ roomState }: Props) => {
    const myAuth = React.useContext(MyAuthContext);
    const componentsState = React.useContext(ComponentsStateContext);
    const drawerType = componentsState.characterDrawerType;
    const dispatch = React.useContext(DispatchRoomComponentsStateContext);
    const operate = React.useContext(OperateContext);
    const [characterKey, setCharacterKey] = React.useState<CompositeKey>();
    const [character, setCharacter] = React.useState<Character.State | typeof notFound>(defaultCharacter);

    const [filesManagerDrawerType, setFilesManagerDrawerType] = React.useState<FilesManagerDrawerType | null>(null);

    const createdByMe = (() => {
        if (characterKey === undefined) {
            return true;
        }
        return characterKey.createdBy === myAuth?.uid;
    })();

    const characterForUseEffect = (() => {
        switch (drawerType?.type) {
            case update: {
                const state = roomState.characters.get(drawerType.stateKey);
                if (state === undefined) {
                    return notFound;
                }
                return { key: drawerType.stateKey, value: state };
            }
            case create:
                return 'create' as const;
            default:
                return null;
        }
    })();

    React.useEffect(() => {
        if (characterForUseEffect == null) {
            return;
        }
        if (characterForUseEffect === 'create' || characterForUseEffect === 'notFound') {
            setCharacter(defaultCharacter);
            return;
        }
        setCharacterKey(characterForUseEffect.key);
        setCharacter(characterForUseEffect.value);
    }, [characterForUseEffect]);

    if (character === notFound) {
        return (
            <Drawer
                {...drawerBaseProps}>
                該当するCharacterが見つかりません。
            </Drawer>
        );
    }

    const pieceLocation = (() => {
        if (drawerType?.type !== update || drawerType.boardKey == null) {
            return null;
        }
        return character.pieceLocations.get(drawerType.boardKey) ?? null;
    })();

    // createのときは、直接setCharacterが呼ばれることでcharacterが変わる。
    // updateのときは、operateが実行されることでroomStateが変わり、useEffectによって変更が検知されてsetCharacterが呼ばれることでcharacterが変わる。
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

    const updatePieceLocation = (partialState: Partial<PieceLocation.State>) => {
        if (pieceLocation == null || drawerType?.type !== update || drawerType.boardKey == null) {
            return;
        }
        const diffOperation = PieceLocation.diff({ prev: pieceLocation, next: { ...pieceLocation, ...partialState } });
        const pieceLocations = createStateMap<OperationElement<PieceLocation.State, PieceLocation.PostOperation>>();
        pieceLocations.set(drawerType.boardKey, {
            type: update,
            operation: diffOperation,
        });
        const operation = Room.createPostOperationSetup();
        operation.characters.set(drawerType.stateKey, {
            type: update,
            operation: {
                pieceLocations,
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
            const id = simpleId();
            const operation = Room.createPostOperationSetup();
            operation.addCharacters.set(id, character);
            operate(operation);
            setCharacterKey(undefined);
            setCharacter(defaultCharacter);
            dispatch({ type: characterDrawerType, newValue: null });
        };
    }

    const pieceLocationElement = (() => {
        if (pieceLocation == null) {
            return null;
        }
        return (
            <>
                <Divider />
                <PageHeader
                    title="コマ" />
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}></Col>
                    <Col span={inputSpan}>
                        <Checkbox
                            checked={pieceLocation.isPrivate}
                            onChange={e => updatePieceLocation({ isPrivate: e.target.checked })}>
                            コマを非公開にする
                        </Checkbox>
                    </Col>
                </Row>

                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}></Col>
                    <Col span={inputSpan}>
                        <Checkbox
                            checked={pieceLocation.isCellMode}
                            onChange={e => updatePieceLocation({ isCellMode: e.target.checked })}>
                            セルにスナップする
                        </Checkbox>
                    </Col>
                </Row>

                {
                    pieceLocation.isCellMode ?
                        <>
                            <Row gutter={gutter} align='middle'>
                                <Col flex='auto' />
                                <Col flex={0}>位置</Col>
                                <Col span={inputSpan}>
                                    <Space>
                                        <InputNumber
                                            value={pieceLocation.cellX}
                                            onChange={newValue => typeof newValue === 'number' ? updatePieceLocation({ cellX: newValue }) : undefined} />
                                        <span>*</span>
                                        <InputNumber
                                            value={pieceLocation.cellY}
                                            onChange={newValue => typeof newValue === 'number' ? updatePieceLocation({ cellY: newValue }) : undefined} />
                                    </Space>
                                </Col>
                            </Row>
                            <Row gutter={gutter} align='middle'>
                                <Col flex='auto' />
                                <Col flex={0}>大きさ</Col>
                                <Col span={inputSpan}>
                                    <Space>
                                        <InputNumber
                                            value={pieceLocation.cellW}
                                            onChange={newValue => typeof newValue === 'number' ? updatePieceLocation({ cellW: newValue }) : undefined} />
                                        <span>*</span>
                                        <InputNumber
                                            value={pieceLocation.cellH}
                                            onChange={newValue => typeof newValue === 'number' ? updatePieceLocation({ cellH: newValue }) : undefined} />
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
                                            value={pieceLocation.x}
                                            onChange={newValue => typeof newValue === 'number' ? updatePieceLocation({ x: newValue }) : undefined} />
                                        <span>*</span>
                                        <InputNumber
                                            value={pieceLocation.y}
                                            onChange={newValue => typeof newValue === 'number' ? updatePieceLocation({ y: newValue }) : undefined} />
                                    </Space>
                                </Col>
                            </Row>
                            <Row gutter={gutter} align='middle'>
                                <Col flex='auto' />
                                <Col flex={0}>大きさ</Col>
                                <Col span={inputSpan}>
                                    <Space>
                                        <InputNumber
                                            value={pieceLocation.w}
                                            onChange={newValue => typeof newValue === 'number' ? updatePieceLocation({ w: newValue }) : undefined} />
                                        <span>*</span>
                                        <InputNumber
                                            value={pieceLocation.h}
                                            onChange={newValue => typeof newValue === 'number' ? updatePieceLocation({ h: newValue }) : undefined} />
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
                    ok={onOkClick == null ? undefined : ({ textType: 'create', onClick: onOkClick })} />)}>
            <div>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}></Col>
                    <Col span={inputSpan}>
                        <Checkbox
                            checked={character.isPrivate}
                            onChange={e => updateCharacter({ isPrivate: e.target.checked })}>
                            キャラクター全体を非公開にする
                        </Checkbox>
                    </Col>
                </Row>

                {pieceLocationElement}

                <Divider />

                <PageHeader
                    title="キャラクター" />

                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>名前</Col>
                    <Col span={inputSpan}>
                        <Input value={character.name} onChange={e => updateCharacter({ name: e.target.value })} />
                    </Col>
                </Row>

                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>アイコン画像</Col>
                    <Col span={inputSpan}>
                        <InputFile filePath={character.image ?? undefined} onPathChange={path => updateCharacter({ image: path ?? undefined })} openFilesManager={setFilesManagerDrawerType} showImage />
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
                                        parameterKey={key}
                                        numberParameter={value}
                                        numberMaxParameter={maxValue}
                                        createdByMe={createdByMe}
                                        onOperate={operation => {
                                            updateCharacterByOperation(operation);
                                        }}/>
                                </Col>
                            </Row>
                        );
                    })
                }
                {
                    strIndex20Array.map(key => {
                        const paramName = roomState.paramNames.get({ type: RoomParameterNameType.Num, key });
                        if (paramName === undefined) {
                            return null;
                        }
                        const value = character.boolParams.get(key);
                        return (
                            <Row key={`numParam${key}Row`} gutter={gutter} align='middle'>
                                <Col flex='auto' />
                                <Col flex={0}>{paramName.name}</Col>
                                <Col span={inputSpan}>
                                    <BooleanParameterInput
                                        parameterKey={key}
                                        booleanParameter={value}
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
                                        parameterKey={key}
                                        stringParameter={value}
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