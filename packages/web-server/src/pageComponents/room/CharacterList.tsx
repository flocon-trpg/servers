/** @jsxImportSource @emotion/react */
import React from 'react';
import { Table, Button, Input, Tooltip } from 'antd';
import { update } from '../../stateManagers/states/types';
import { NumberParameterInput } from '../../components/NumberParameterInput';
import { BooleanParameterInput } from '../../components/BooleanParameterInput';
import { StringParameterInput } from '../../components/StringParameterInput';
import * as Icon from '@ant-design/icons';
import { ToggleButton } from '../../components/ToggleButton';
import {
    characterIsPrivate,
    characterIsNotPrivate,
    characterIsNotPrivateAndNotCreatedByMe,
} from '../../resource/text/main';
import { useCharacters } from '../../hooks/state/useCharacters';
import { useParticipants } from '../../hooks/state/useParticipants';
import {
    useBoolParamNames,
    useNumParamNames,
    useStrParamNames,
} from '../../hooks/state/useParamNames';
import {
    CharacterState,
    ParamNameState,
    ParticipantState,
    StrIndex20,
    strIndex20Array,
} from '@flocon-trpg/core';
import _ from 'lodash';
import classNames from 'classnames';
import { flex, flexRow, itemsCenter } from '../../utils/className';
import { ColumnType } from 'antd/lib/table';
import { SortOrder } from 'antd/lib/table/interface';
import { IconView } from '../../components/IconView';
import { getUserUid, MyAuthContext } from '../../contexts/MyAuthContext';
import { useSetRoomStateWithImmer } from '../../hooks/useSetRoomStateWithImmer';
import { create } from '../../utils/constants';
import { useUpdateAtom } from 'jotai/utils';
import { characterParameterNamesDrawerVisibilityAtom } from '../../atoms/overlay/characterParameterNamesDrawerVisibilityAtom';
import { characterEditorDrawerAtom } from './CharacterEditorModal';

type DataSource = {
    key: string;
    character: {
        stateId: string;
        state: CharacterState;
        createdByMe: boolean | null;
    };
    participants: ReadonlyMap<string, ParticipantState>;
    onOperateCharacter: (mapping: (operation: CharacterState) => CharacterState) => void;
};

const minNumParameter = -1000000;
const maxNumParameter = 1000000;

const createBooleanParameterColumn = ({
    key,
    boolParamNames,
}: {
    key: StrIndex20;
    boolParamNames: ReadonlyMap<string, ParamNameState>;
}): ColumnType<DataSource> | null => {
    const reactKey = `boolParameter${key}`;
    const name = boolParamNames.get(key);
    if (name == null) {
        return null;
    }
    const booleanToNumber = (
        value: boolean | null | undefined,
        sortOrder: SortOrder | undefined
    ) => {
        if (value == null) {
            return sortOrder === 'ascend' ? 2 : -2;
        }
        return value ? 1 : -1;
    };
    return {
        title: name.name,
        key: reactKey,
        sorter: (x, y, sortOrder) =>
            booleanToNumber(x.character.state.boolParams[key]?.value, sortOrder) -
            booleanToNumber(y.character.state.boolParams[key]?.value, sortOrder),
        // eslint-disable-next-line react/display-name
        render: (_: unknown, { character, onOperateCharacter }: DataSource) => {
            return (
                <>
                    <BooleanParameterInput
                        isCharacterPrivate={character.state.isPrivate}
                        isCreate={false}
                        compact
                        parameterKey={key}
                        parameter={character.state.boolParams[key]}
                        createdByMe={character.createdByMe ?? false}
                        onOperate={mapping => {
                            onOperateCharacter(mapping);
                        }}
                    />
                </>
            );
        },
    };
};

const createNumParameterColumn = ({
    key,
    numParamNames,
}: {
    key: StrIndex20;
    numParamNames: ReadonlyMap<string, ParamNameState>;
}): ColumnType<DataSource> | null => {
    const reactKey = `numParameter${key}`;
    const name = numParamNames.get(key);
    if (name == null) {
        return null;
    }
    return {
        title: name.name,
        key: reactKey,
        sorter: (x, y, sortOrder) => {
            const defaultValue = sortOrder === 'ascend' ? Number.MAX_VALUE : Number.MIN_VALUE;
            return (
                (x.character.state.numParams[key]?.value ?? defaultValue) -
                (y.character.state.numParams[key]?.value ?? defaultValue)
            );
        },
        sortDirections: ['descend', 'ascend'],
        // eslint-disable-next-line react/display-name
        render: (_: unknown, { character, onOperateCharacter }: DataSource) => {
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
                        onOperate={mapping => {
                            onOperateCharacter(mapping);
                        }}
                    />
                </>
            );
        },
    };
};

const createStringParameterColumn = ({
    key,
    strParamNames,
}: {
    key: StrIndex20;
    strParamNames: ReadonlyMap<string, ParamNameState>;
}): ColumnType<DataSource> | null => {
    const reactKey = `strmParameter${key}`;
    const name = strParamNames.get(key);
    if (name == null) {
        return null;
    }
    return {
        title: name.name,
        key: reactKey,
        sorter: (x, y) => {
            // 現在の仕様では、StringParameterは他のパラメーターと異なりundefinedでも''と同じとみなされるため、それに合わせている。
            const xValue = x.character.state.strParams[key]?.value ?? '';
            const yValue = y.character.state.strParams[key]?.value ?? '';
            return xValue.localeCompare(yValue);
        },
        // eslint-disable-next-line react/display-name
        render: (_: unknown, { character, onOperateCharacter }: DataSource) => {
            return (
                <>
                    <StringParameterInput
                        compact
                        isCharacterPrivate={character.state.isPrivate}
                        isCreate={false}
                        parameterKey={key}
                        parameter={character.state.strParams[key]}
                        createdByMe={character.createdByMe ?? false}
                        onOperate={mapping => {
                            onOperateCharacter(mapping);
                        }}
                    />
                </>
            );
        },
    };
};

export const CharacterList: React.FC = () => {
    const myAuth = React.useContext(MyAuthContext);
    const setRoomState = useSetRoomStateWithImmer();
    const setCharacterEditorDrawer = useUpdateAtom(characterEditorDrawerAtom);
    const setCharacterParameterNamesDrawerVisibility = useUpdateAtom(
        characterParameterNamesDrawerVisibilityAtom
    );

    const characters = useCharacters();
    const participants = useParticipants();
    const boolParamNames = useBoolParamNames();
    const numParamNames = useNumParamNames();
    const strParamNames = useStrParamNames();

    if (
        characters == null ||
        participants == null ||
        boolParamNames == null ||
        numParamNames == null ||
        strParamNames == null
    ) {
        return null;
    }

    const operateCharacter =
        (characterId: string) => (mapping: (character: CharacterState) => CharacterState) => {
            setRoomState(roomState => {
                const character = roomState.characters[characterId];
                if (character == null) {
                    return;
                }
                roomState.characters[characterId] = mapping(character);
            });
        };

    const charactersDataSource: DataSource[] = [...characters].map(([characterId, character]) => {
        const createdByMe = getUserUid(myAuth) === characterId;
        return {
            key: characterId, // antdのtableのkeyとして必要
            character: {
                stateId: characterId,
                state: character,
                createdByMe,
            },
            participants,
            onOperateCharacter: operateCharacter(characterId),
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
                        style={{ alignSelf: 'center' }}
                        size='small'
                        onClick={() =>
                            setCharacterEditorDrawer({
                                type: update,
                                stateId: character.stateId,
                            })
                        }
                    >
                        <Icon.SettingOutlined />
                    </Button>
                </Tooltip>
            ),
        },
        {
            title: '',
            key: '全体公開',
            width: 36,
            // eslint-disable-next-line react/display-name
            render: (_: unknown, { character }: DataSource) => (
                <ToggleButton
                    size='small'
                    checked={!character.state.isPrivate}
                    disabled={
                        character.createdByMe ? false : characterIsNotPrivateAndNotCreatedByMe
                    }
                    showAsTextWhenDisabled
                    checkedChildren={<Icon.EyeOutlined />}
                    unCheckedChildren={<Icon.EyeInvisibleOutlined />}
                    tooltip={
                        character.state.isPrivate
                            ? characterIsPrivate({ isCreate: false })
                            : characterIsNotPrivate({ isCreate: false })
                    }
                    onChange={newValue => {
                        setRoomState(roomState => {
                            const targetCharacter = roomState.characters[character.stateId];
                            if (targetCharacter == null) {
                                return;
                            }
                            targetCharacter.isPrivate = !newValue;
                        });
                    }}
                />
            ),
        },
        {
            title: '名前',
            key: 'name',
            sorter: (x, y) => x.character.state.name.localeCompare(y.character.state.name),
            // eslint-disable-next-line react/display-name
            render: (_: unknown, { character }: DataSource) => (
                <div className={classNames(flex, flexRow, itemsCenter)}>
                    {character.state.image == null ? (
                        <Icon.UserOutlined />
                    ) : (
                        <IconView size={20} image={character.state.image} />
                    )}
                    <div style={{ width: 4 }} />
                    <Input
                        style={{ minWidth: 100 }}
                        value={character.state.name}
                        size='small'
                        onChange={newValue => {
                            setRoomState(state => {
                                const targetCharacter = state.characters[character.stateId];
                                if (targetCharacter == null) {
                                    return;
                                }
                                targetCharacter.name = newValue.target.value;
                            });
                        }}
                    />
                </div>
            ),
        },
        ...strIndex20Array.map(key => createNumParameterColumn({ key, numParamNames })),
        ...strIndex20Array.map(key => createBooleanParameterColumn({ key, boolParamNames })),
        ...strIndex20Array.map(key => createStringParameterColumn({ key, strParamNames })),
    ])
        .compact()
        .value();

    return (
        <div>
            <Button size='small' onClick={() => setCharacterEditorDrawer({ type: create })}>
                キャラクターを作成
            </Button>
            <Button size='small' onClick={() => setCharacterParameterNamesDrawerVisibility(true)}>
                パラメーターを追加・編集・削除
            </Button>
            <Table
                columns={columns}
                dataSource={charactersDataSource}
                size='small'
                pagination={false}
            />
        </div>
    );
};
