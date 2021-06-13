/** @jsxImportSource @emotion/react */
import React from 'react';
import MyAuthContext from '../../contexts/MyAuthContext';
import { Table, Button, Input, Tooltip, Popover } from 'antd';
import { update } from '../../stateManagers/states/types';
import { FilePathFragment } from '../../generated/graphql';
import NumberParameterInput from '../../components/NumberParameterInput';
import BooleanParameterInput from '../../components/BooleanParameterInput';
import StringParameterInput from '../../components/StringParameterInput';
import { useFirebaseStorageUrl } from '../../hooks/firebaseStorage';
import * as Icon from '@ant-design/icons';
import ToggleButton from '../../components/ToggleButton';
import { characterIsPrivate, characterIsNotPrivate, characterIsNotPrivateAndNotCreatedByMe } from '../../resource/text/main';
import { getUserUid } from '../../hooks/useFirebaseUser';
import { useOperate } from '../../hooks/useOperate';
import { useCharacters } from '../../hooks/state/useCharacters';
import { useParticipants } from '../../hooks/state/useParticipants';
import { useBoolParamNames, useNumParamNames, useStrParamNames } from '../../hooks/state/useParamNames';
import { CharacterState, FilePath, ParamNameState, ParticipantState, UpOperation } from '@kizahasi/flocon-core';
import { CompositeKey, compositeKeyToString, StrIndex20, strIndex20Array } from '@kizahasi/util';
import _ from 'lodash';
import { useDispatch } from 'react-redux';
import { create, roomDrawerAndPopoverModule } from '../../modules/roomDrawerAndPopoverModule';

type DataSource = {
    key: string;
    character: {
        stateKey: CompositeKey;
        state: CharacterState;
        createdByMe: boolean | null;
    };
    participants: ReadonlyMap<string, ParticipantState>;
    operate: (operation: UpOperation) => void;
}

const minNumParameter = -1000000;
const maxNumParameter = 1000000;

const createBooleanParameterColumn = ({
    key,
    boolParamNames,
}: {
    key: StrIndex20;
    boolParamNames: ReadonlyMap<string, ParamNameState>;
}) => {
    const reactKey = `boolParameter${key}`;
    const name = boolParamNames.get(key);
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
                        parameter={character.state.boolParams[key]}
                        createdByMe={character.createdByMe ?? false}
                        onOperate={characterOperation => {
                            const operation: UpOperation = {
                                $version: 1,
                                characters: {
                                    [character.stateKey.createdBy]: {
                                        [character.stateKey.id]: {
                                            type: update,
                                            update: characterOperation,
                                        }
                                    }
                                }
                            };
                            operate(operation);
                        }} />
                </>);
        },
    };
};

const createNumParameterColumn = ({
    key,
    numParamNames,
}: {
    key: StrIndex20;
    numParamNames: ReadonlyMap<string, ParamNameState>;
}) => {
    const reactKey = `numParameter${key}`;
    const name = numParamNames.get(key);
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
                        numberParameter={character.state.numParams[key]}
                        numberMaxParameter={character.state.numMaxParams[key]}
                        createdByMe={character.createdByMe ?? false}
                        onOperate={characterOperation => {
                            const operation: UpOperation = {
                                $version: 1,
                                characters: {
                                    [character.stateKey.createdBy]: {
                                        [character.stateKey.id]: {
                                            type: update,
                                            update: characterOperation,
                                        }
                                    }
                                }
                            };
                            operate(operation);
                        }} />
                </>);
        },
    };
};

const createStringParameterColumn = ({
    key,
    strParamNames,
}: {
    key: StrIndex20;
    strParamNames: ReadonlyMap<string, ParamNameState>;
}) => {
    const reactKey = `strmParameter${key}`;
    const name = strParamNames.get(key);
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
                        parameter={character.state.strParams[key]}
                        createdByMe={character.createdByMe ?? false}
                        onOperate={characterOperation => {
                            const operation: UpOperation = {
                                $version: 1,
                                characters: {
                                    [character.stateKey.createdBy]: {
                                        [character.stateKey.id]: {
                                            type: update,
                                            update: characterOperation,
                                        }
                                    }
                                }
                            };
                            operate(operation);
                        }} />
                </>);
        },
    };
};

const Image: React.FC<{ filePath?: FilePathFragment | FilePath; iconSize: boolean }> = ({ filePath, iconSize }: { filePath?: FilePathFragment | FilePath; iconSize: boolean }) => {
    const src = useFirebaseStorageUrl(filePath);
    if (src == null) {
        return null;
    }
    return (<img src={src} width={iconSize ? 20 : 150} height={iconSize ? 20 : 150} />);
};

const CharacterList: React.FC = () => {
    const myAuth = React.useContext(MyAuthContext);
    const dispatch = useDispatch();
    const operate = useOperate();

    const characters = useCharacters();
    const participants = useParticipants();
    const boolParamNames = useBoolParamNames();
    const numParamNames = useNumParamNames();
    const strParamNames = useStrParamNames();

    if (characters == null || participants == null || boolParamNames == null || numParamNames == null || strParamNames == null) {
        return null;
    }

    const charactersDataSource: DataSource[] =
        characters.toArray().map(([key, character]) => {
            const createdByMe = getUserUid(myAuth) === key.createdBy;
            return {
                key: compositeKeyToString(key), // antdのtableのkeyとして必要
                character: {
                    stateKey: key,
                    state: character,
                    createdByMe,
                },
                participants,
                operate,
            };
        });

    const columns = _([
        {
            title: '',
            key: 'menu',
            width: 36,
            // eslint-disable-next-line react/display-name
            render: (_: unknown, { character }: DataSource) => (
                <Tooltip title='編集'>
                    <Button
                        style={({ alignSelf: 'center' })}
                        size='small'
                        onClick={() => dispatch(roomDrawerAndPopoverModule.actions.set({ characterDrawerType: { type: update, stateKey: character.stateKey } }))}>
                        <Icon.SettingOutlined />
                    </Button>
                </Tooltip>),
        },
        {
            title: '',
            key: '全体公開',
            width: 36,
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
                        const operation: UpOperation = {
                            $version: 1,
                            characters: {
                                [character.stateKey.createdBy]: {
                                    [character.stateKey.id]: {
                                        type: update,
                                        update: {
                                            $version: 1,
                                            isPrivate: { newValue: !newValue },
                                        },
                                    }
                                }
                            }
                        };
                        operate(operation);
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
                            const operation: UpOperation = {
                                $version: 1,
                                characters: {
                                    [character.stateKey.createdBy]: {
                                        [character.stateKey.id]: {
                                            type: update,
                                            update: {
                                                $version: 1,
                                                name: { newValue: newValue.target.value },
                                            },
                                        }
                                    }
                                }
                            };
                            operate(operation);
                        }} />
                </div>),
        },
        ...strIndex20Array.map(key => createNumParameterColumn({ key, numParamNames })),
        ...strIndex20Array.map(key => createBooleanParameterColumn({ key, boolParamNames })),
        ...strIndex20Array.map(key => createStringParameterColumn({ key, strParamNames })),
    ]).compact().value();

    return (
        <div>
            <Button size='small' onClick={() => dispatch(roomDrawerAndPopoverModule.actions.set({ characterDrawerType: { type: create } }))}>
                キャラクターを作成
            </Button>
            <Button size='small' onClick={() => dispatch(roomDrawerAndPopoverModule.actions.set({ characterParameterNamesDrawerVisibility: true }))}>
                パラメーターを追加・編集・削除
            </Button>
            <Table columns={columns} dataSource={charactersDataSource} size='small' pagination={false} />
        </div>);
};

export default CharacterList;