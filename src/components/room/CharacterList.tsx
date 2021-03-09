import React from 'react';
import MyAuthContext from '../../contexts/MyAuthContext';
import { Table, Checkbox, Button, InputNumber, Input, Dropdown, Menu, Switch, Tooltip, Popover } from 'antd';
import { CompositeKey, compositeKeyToString, createStateMap, StateMap } from '../../@shared/StateMap';
import { secureId, simpleId } from '../../utils/generators';
import { replace, update } from '../../stateManagers/states/types';
import { __ } from '../../@shared/collection';
import { characterDrawerType, characterParameterNamesDrawerVisibility, create, RoomComponentsState } from './RoomComponentsState';
import DispatchRoomComponentsStateContext from './contexts/DispatchRoomComponentsStateContext';
import OperateContext from './contexts/OperateContext';
import { FilePathFragment, RoomParameterNameType } from '../../generated/graphql';
import { TextTwoWayOperation } from '../../@shared/textOperation';
import { StrIndex20, strIndex20Array } from '../../@shared/indexes';
import produce from 'immer';
import NumberParameterInput from '../../foundations/NumberParameterInput';
import BooleanParameterInput from '../../foundations/BooleanParameterInput';
import StringParameterInput from '../../foundations/StringParameterInput';
import { useFirebaseStorageUrl } from '../../hooks/firebaseStorage';
import * as Icon from '@ant-design/icons';
import ToggleButton from '../../foundations/ToggleButton';
import { characterIsPrivate, characterIsNotPrivate, parameterIsPrivateAndNotCreatedByMe, characterIsNotPrivateAndNotCreatedByMe } from '../../resource/text/main';
import { Character } from '../../stateManagers/states/character';
import { Room } from '../../stateManagers/states/room';
import { Participant } from '../../stateManagers/states/participant';
import { getUserUid } from '../../hooks/useFirebaseUser';

const characterOperationBase: Character.PostOperation = {
    boolParams: new Map(),
    numParams: new Map(),
    numMaxParams: new Map(),
    strParams: new Map(),
    pieces: createStateMap(),
    tachieLocations: createStateMap(),
};

type Props = {
    room: Room.State;
}

type DataSource = {
    key: string;
    character: {
        stateKey: CompositeKey;
        state: Character.State;
        createdByMe: boolean | null;
    };
    participants: ReadonlyMap<string, Participant.State>;
    operate: (operation: Room.PostOperationSetup) => void;
}

const minNumParameter = -1000000;
const maxNumParameter = 1000000;

const createBooleanParameterColumn = ({
    key,
    room,
}: {
    key: StrIndex20;
    room: Room.State;
}) => {
    const reactKey = `boolParameter${key}`;
    const name = room.paramNames.get({ key: key, type: RoomParameterNameType.Bool });
    if (name == null) {
        return null;
    }
    return {
        title: name.name,
        key: reactKey,
        // eslint-disable-next-line react/display-name
        render: (_: unknown, { character, operate }: DataSource) => {
            return (
                <>
                    <BooleanParameterInput
                        isCharacterPrivate={character.state.isPrivate}
                        isCreate={false}
                        compact
                        parameterKey={key}
                        parameter={character.state.boolParams.get(key)}
                        createdByMe={character.createdByMe ?? false}
                        onOperate={characterOperation => {
                            const operation = Room.createPostOperationSetup();
                            operation.characters.set(character.stateKey, {
                                type: update,
                                operation: characterOperation,
                            });
                            operate(operation);
                        }} />
                </>);
        },
    };
};

const createNumParameterColumn = ({
    key,
    room,
}: {
    key: StrIndex20;
    room: Room.State;
}) => {
    const reactKey = `numParameter${key}`;
    const name = room.paramNames.get({ key: key, type: RoomParameterNameType.Num });
    if (name == null) {
        return null;
    }
    return {
        title: name.name,
        key: reactKey,
        // eslint-disable-next-line react/display-name
        render: (_: unknown, { character, operate }: DataSource) => {
            return (
                <>
                    <NumberParameterInput
                        isCharacterPrivate={character.state.isPrivate}
                        isCreate={false}
                        compact
                        parameterKey={key}
                        numberParameter={character.state.numParams.get(key)}
                        numberMaxParameter={character.state.numMaxParams.get(key)}
                        createdByMe={character.createdByMe ?? false}
                        onOperate={characterOperation => {
                            const operation = Room.createPostOperationSetup();
                            operation.characters.set(character.stateKey, {
                                type: update,
                                operation: characterOperation,
                            });
                            operate(operation);
                        }} />
                </>);
        },
    };
};

const createStringParameterColumn = ({
    key,
    room,
}: {
    key: StrIndex20;
    room: Room.State;
}) => {
    const reactKey = `strmParameter${key}`;
    const name = room.paramNames.get({ key: key, type: RoomParameterNameType.Str });
    if (name == null) {
        return null;
    }
    return {
        title: name.name,
        key: reactKey,
        // eslint-disable-next-line react/display-name
        render: (_: unknown, { character, operate }: DataSource) => {
            return (
                <>
                    <StringParameterInput
                        compact
                        isCharacterPrivate={character.state.isPrivate}
                        isCreate={false}
                        parameterKey={key}
                        parameter={character.state.strParams.get(key)}
                        createdByMe={character.createdByMe ?? false}
                        onOperate={characterOperation => {
                            const operation = Room.createPostOperationSetup();
                            operation.characters.set(character.stateKey, {
                                type: update,
                                operation: characterOperation,
                            });
                            operate(operation);
                        }} />
                </>);
        },
    };
};

const Image: React.FC<{ filePath?: FilePathFragment; iconSize: boolean }> = ({ filePath, iconSize }: { filePath?: FilePathFragment; iconSize: boolean }) => {
    const src = useFirebaseStorageUrl(filePath);
    if (src == null) {
        return null;
    }
    return (<img src={src} width={iconSize ? 25 : 150} height={iconSize ? 25 : 150} />);
};

const CharacterList: React.FC<Props> = ({ room }: Props) => {
    const myAuth = React.useContext(MyAuthContext);
    const dispatch = React.useContext(DispatchRoomComponentsStateContext);
    const dispatchRoomComponentsState = React.useContext(DispatchRoomComponentsStateContext);
    const operate = React.useContext(OperateContext);

    const charactersDataSource: DataSource[] =
        room.characters.toArray().map(([key, character]) => {
            const createdByMe = getUserUid(myAuth) === key.createdBy;
            return {
                key: compositeKeyToString(key), // antdのtableのkeyとして必要
                character: {
                    stateKey: key,
                    state: character,
                    createdByMe,
                },
                participants: room.participants,
                operate,
            };
        });

    const columns = __([
        {
            title: '',
            key: 'menu',
            width: 44,
            // eslint-disable-next-line react/display-name
            render: (_: unknown, { character }: DataSource) => (
                <Tooltip title='編集'>
                    <Button
                        style={({ alignSelf: 'center' })}
                        size='small'
                        onClick={() => dispatchRoomComponentsState({ type: characterDrawerType, newValue: { type: update, stateKey: character.stateKey } })}>
                        <Icon.SettingOutlined />
                    </Button>
                </Tooltip>),
        },
        {
            title: '全体公開',
            key: '全体公開',
            width: 80,
            // eslint-disable-next-line react/display-name
            render: (_: unknown, { character, operate }: DataSource) => (
                <ToggleButton
                    size='small'
                    checked={!character.state.isPrivate}
                    disabled={character.createdByMe ? false : characterIsNotPrivateAndNotCreatedByMe}
                    showAsTextWhenDisabled
                    checkedChildren={<Icon.EyeOutlined />}
                    unCheckedChildren={<Icon.EyeInvisibleOutlined />}
                    tooltip={character.state.isPrivate ? characterIsPrivate({ isCreate: false }) : characterIsNotPrivate({ isCreate: false })}
                    onChange={newValue => {
                        const setup = Room.createPostOperationSetup();
                        const characterOperation: Character.PostOperation = {
                            ...characterOperationBase,
                            isPrivate: {
                                newValue: !newValue,
                            },
                        };
                        setup.characters.set(character.stateKey, {
                            type: update,
                            operation: characterOperation,
                        });
                        operate(setup);
                    }} />)
        },
        {
            title: '名前',
            key: 'name',
            // eslint-disable-next-line react/display-name
            render: (_: unknown, { character }: DataSource) => (
                <div style={({ display: 'flex', flexDirection: 'row', alignItems: 'center' })}>
                    {character.state.image == null ?
                        <Icon.UserOutlined /> :
                        <Popover trigger='hover' content={<Image filePath={character.state.image ?? undefined} iconSize={false} />}>
                            <div>
                                <Image filePath={character.state.image ?? undefined} iconSize={true} />
                            </div>
                        </Popover>}
                    <div style={({ width: 4 })} />
                    <Input 
                        style={({ minWidth: 100 })}
                        value={character.state.name} 
                        size='small'
                        onChange={newValue => {
                            const setup = Room.createPostOperationSetup();
                            const characterOperation: Character.PostOperation = {
                                ...characterOperationBase,
                                name: {
                                    newValue: newValue.target.value,
                                },
                            };
                            setup.characters.set(character.stateKey, {
                                type: update,
                                operation: characterOperation,
                            });
                            operate(setup);
                        }} />
                </div>),
        },
        {
            title: '作成者',
            key: '作成者',
            // eslint-disable-next-line react/display-name
            render: (_: unknown, { character, participants: $participants }: DataSource) => {
                const participant = $participants.get(character.stateKey.createdBy);
                if (participant == null) {
                    return '?';
                }
                return (
                    <div style={({ whiteSpace: 'nowrap' })}>
                        <span>{participant.name}</span>
                        {character.createdByMe === true ? <span style={({ fontWeight: 'bold' })}> (自分)</span> : null}
                    </div>
                );
            },
        },
        ...strIndex20Array.map(key => createNumParameterColumn({ key, room })),
        ...strIndex20Array.map(key => createBooleanParameterColumn({ key, room })),
        ...strIndex20Array.map(key => createStringParameterColumn({ key, room })),
    ]).compact(x => x).toArray();

    return (
        <div>
            <Button size='small' onClick={() => dispatch({ type: characterDrawerType, newValue: { type: create } })}>
                キャラクターを作成
            </Button>
            <Button size='small' onClick={() => dispatch({ type: characterParameterNamesDrawerVisibility, newValue: true })}>
                パラメーターを追加・編集・削除
            </Button>
            <Table columns={columns} dataSource={charactersDataSource} size='small' />
        </div>);
};

export default CharacterList;