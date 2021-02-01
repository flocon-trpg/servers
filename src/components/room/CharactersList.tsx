import React from 'react';
import MyAuthContext from '../../contexts/MyAuthContext';
import { Table, Checkbox, Button, InputNumber, Input } from 'antd';
import * as Room from '../../stateManagers/states/room';
import * as Character from '../../stateManagers/states/character';
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
                        parameterKey={key}
                        booleanParameter={character.state.boolParams.get(key)}
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
                        parameterKey={key}
                        stringParameter={character.state.strParams.get(key)}
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

const Image: React.FC<{ filePath?: FilePathFragment }> = ({ filePath }: { filePath?: FilePathFragment }) => {
    const src = useFirebaseStorageUrl(filePath);
    if (src == null) {
        return null;
    }
    return (<img src={src} width={30} height={30} />);
};

const CharactersList: React.FC<Props> = (props: Props) => {
    const myAuth = React.useContext(MyAuthContext);
    const dispatch = React.useContext(DispatchRoomComponentsStateContext);
    const dispatchRoomComponentsState = React.useContext(DispatchRoomComponentsStateContext);
    const operate = React.useContext(OperateContext);

    const charactersDataSource: DataSource[] =
        props.room.characters.toArray().map(([key, character]) => {
            const createdByMe = myAuth == null ? null : (myAuth.uid === key.createdBy);
            return {
                key: compositeKeyToString(key), // antdのtableのkeyとして必要
                character: {
                    stateKey: key,
                    state: character,
                    createdByMe,
                },
                operate,
            };
        });

    const columns = __([
        {
            title: 'Image',
            key: 'image',
            // eslint-disable-next-line react/display-name
            render: (_: unknown, { character }: DataSource) => (<Image filePath={character.state.image ?? undefined} />),
        },
        {
            title: 'Name',
            key: 'name',
            // eslint-disable-next-line react/display-name
            render: (_: unknown, { character }: DataSource) => character.state.name,
        },
        {
            title: 'CreatedByMe',
            key: 'createdByMe',
            // eslint-disable-next-line react/display-name
            render: (_: unknown, { character }: DataSource) => {
                if (character.createdByMe == null) {
                    return '?';
                }
                return character.createdByMe ? 'o' : 'x';
            },
        },
        {
            title: 'Open',
            key: 'open',
            // eslint-disable-next-line react/display-name
            render: (_: unknown, { character }: DataSource) => (<Checkbox checked={character.state.isPrivate} />)
        },
        ...strIndex20Array.map(key => createNumParameterColumn({ key, room: props.room })),
        ...strIndex20Array.map(key => createBooleanParameterColumn({ key, room: props.room })),
        ...strIndex20Array.map(key => createStringParameterColumn({ key, room: props.room })),
        {
            title: '',
            dataIndex: 'details',
            key: 'details',
            // eslint-disable-next-line react/display-name
            render: (_: unknown, { character }: DataSource) =>
                (
                    <Button onClick={() => dispatchRoomComponentsState({ type: characterDrawerType, newValue: { type: update, stateKey: character.stateKey } })}>詳細</Button>
                )
        }
    ]).compact(x => x).toArray();

    return (
        <div>
            <Button onClick={() => dispatch({ type: characterDrawerType, newValue: { type: create } })}>
                キャラクターを作成
            </Button>
            <Button onClick={() => dispatch({ type: characterParameterNamesDrawerVisibility, newValue: true })}>
                パラメーターを追加・編集・削除
            </Button>
            <Table columns={columns} dataSource={charactersDataSource} />
        </div>);
};

export default CharactersList;