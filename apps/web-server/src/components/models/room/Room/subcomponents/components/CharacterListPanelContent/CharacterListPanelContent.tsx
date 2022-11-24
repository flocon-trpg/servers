/** @jsxImportSource @emotion/react */
import * as Icon from '@ant-design/icons';
import {
    State,
    StrIndex20,
    characterTemplate,
    paramNameTemplate,
    strIndex10Array,
    update,
} from '@flocon-trpg/core';
import { loggerRef } from '@flocon-trpg/utils';
import {
    Alert,
    Table as AntdTable,
    Button,
    Checkbox,
    Dropdown,
    Input,
    Menu,
    Modal,
    Tooltip,
} from 'antd';
import { ColumnType } from 'antd/lib/table';
import { SortOrder } from 'antd/lib/table/interface';
import classNames from 'classnames';
import produce from 'immer';
import { useUpdateAtom } from 'jotai/utils';
import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { IconView } from '../../../../../file/IconView/IconView';
import { useCharacterTagNames } from '../../hooks/useCharacterTagNames';
import { useCharacters } from '../../hooks/useCharacters';
import { useBoolParamNames, useNumParamNames, useStrParamNames } from '../../hooks/useParamNames';
import { useSetRoomStateWithImmer } from '../../hooks/useSetRoomStateWithImmer';
import { BooleanParameterInput } from '../BooleanParameterInput/BooleanParameterInput';
import { characterEditorModalAtom } from '../CharacterEditorModal/CharacterEditorModal';
import { characterParameterNamesEditorVisibilityAtom } from '../CharacterParameterNamesEditorModal/CharacterParameterNamesEditorModal';
import { characterTagNamesEditorVisibilityAtom } from '../CharacterTagNamesEditorModal/CharacterTagNamesEditorModal';
import { importCharacterModalVisibilityAtom } from '../ImportCharacterModal/ImportCharacterModal';
import { NumberParameterInput } from '../NumberParameterInput/NumberParameterInput';
import { OverriddenParameterNameEditor } from '../OverriddenParameterNameEditor/OverriddenParameterNameEditor';
import { StringParameterInput } from '../StringParameterInput/StringParameterInput';
import { CharacterTabName } from './subcomponents/components/CharacterTabName/CharacterTabName';
import { roomConfigAtom } from '@/atoms/roomConfigAtom/roomConfigAtom';
import { CharacterTabConfig } from '@/atoms/roomConfigAtom/types/characterTabConfig';
import { CharacterTabConfigUtils } from '@/atoms/roomConfigAtom/types/characterTabConfig/utils';
import { RowKeys } from '@/atoms/roomConfigAtom/types/charactersPanelConfig';
import { CollaborativeInput } from '@/components/ui/CollaborativeInput/CollaborativeInput';
import { DialogFooter } from '@/components/ui/DialogFooter/DialogFooter';
import { DraggableTabs } from '@/components/ui/DraggableTabs/DraggableTabs';
import { Table, TableDivider, TableRow } from '@/components/ui/Table/Table';
import { ToggleButton } from '@/components/ui/ToggleButton/ToggleButton';
import { useAtomSelector } from '@/hooks/useAtomSelector';
import { useImmerUpdateAtom } from '@/hooks/useImmerUpdateAtom';
import { useMyUserUid } from '@/hooks/useMyUserUid';
import {
    characterIsNotPrivate,
    characterIsNotPrivateAndNotCreatedByMe,
    characterIsPrivate,
} from '@/resources/text/main';
import { cancelRnd, flex, flexRow, itemsCenter } from '@/styles/className';
import { create } from '@/utils/constants';
import { KeySorter } from '@/utils/keySorter';
import { moveElement } from '@/utils/moveElement';
import { AntdTab } from '@/utils/types';
import { defaultTriggerSubMenuAction } from '@/utils/variables';

type CharacterState = State<typeof characterTemplate>;
type ParamNameState = State<typeof paramNameTemplate>;

type DataSource = {
    key: string;
    character: {
        stateId: string;
        state: CharacterState;
        createdByMe: boolean | null;
    };
    onOperateCharacter: (mapping: (operation: CharacterState) => CharacterState) => void;
};

const overriddenParameterNamePadding = 6;

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
        title: <TableHeaderCell title={name.name} rowKey={RowKeys.BoolParam(key)} />,
        key: reactKey,
        sorter: (x, y, sortOrder) =>
            booleanToNumber(x.character.state.boolParams?.[key]?.value, sortOrder) -
            booleanToNumber(y.character.state.boolParams?.[key]?.value, sortOrder),
        // eslint-disable-next-line react/display-name
        render: (_: unknown, { character, onOperateCharacter }: DataSource) => {
            return (
                <div className={classNames(flex, flexRow)}>
                    <OverriddenParameterNameEditor
                        type='table'
                        overriddenParameterName={
                            character.state.boolParams?.[key]?.overriddenParameterName
                        }
                        onOverriddenParameterNameChange={newName =>
                            onOperateCharacter(character =>
                                produce(character, character => {
                                    const boolParam = character.boolParams?.[key];
                                    if (boolParam == null) {
                                        return;
                                    }
                                    boolParam.overriddenParameterName = newName;
                                })
                            )
                        }
                    />
                    <div style={{ paddingLeft: overriddenParameterNamePadding }} />
                    <BooleanParameterInput
                        isCharacterPrivate={character.state.isPrivate}
                        isCreate={false}
                        compact
                        parameterKey={key}
                        parameter={character.state.boolParams?.[key]}
                        createdByMe={character.createdByMe ?? false}
                        onOperate={mapping => {
                            onOperateCharacter(mapping);
                        }}
                    />
                </div>
            );
        },
    };
};

const createNumberParameterColumn = ({
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
        title: <TableHeaderCell title={name.name} rowKey={RowKeys.NumParam(key)} />,
        key: reactKey,
        sorter: (x, y, sortOrder) => {
            const defaultValue = sortOrder === 'ascend' ? Number.MAX_VALUE : Number.MIN_VALUE;
            return (
                (x.character.state.numParams?.[key]?.value ?? defaultValue) -
                (y.character.state.numParams?.[key]?.value ?? defaultValue)
            );
        },
        sortDirections: ['descend', 'ascend'],
        // eslint-disable-next-line react/display-name
        render: (_: unknown, { character, onOperateCharacter }: DataSource) => {
            return (
                <div className={classNames(flex, flexRow)}>
                    <OverriddenParameterNameEditor
                        type='table'
                        overriddenParameterName={
                            character.state.numParams?.[key]?.overriddenParameterName
                        }
                        onOverriddenParameterNameChange={newName =>
                            onOperateCharacter(character =>
                                produce(character, character => {
                                    const numParam = character.numParams?.[key];
                                    if (numParam == null) {
                                        return;
                                    }
                                    numParam.overriddenParameterName = newName;
                                })
                            )
                        }
                    />
                    <div style={{ paddingLeft: overriddenParameterNamePadding }} />
                    <NumberParameterInput
                        isCharacterPrivate={character.state.isPrivate}
                        isCreate={false}
                        compact
                        parameterKey={key}
                        numberParameter={character.state.numParams?.[key]}
                        numberMaxParameter={character.state.numMaxParams?.[key]}
                        createdByMe={character.createdByMe ?? false}
                        onOperate={mapping => {
                            onOperateCharacter(mapping);
                        }}
                    />
                </div>
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
        title: <TableHeaderCell title={name.name} rowKey={RowKeys.StrParam(key)} />,
        key: reactKey,
        sorter: (x, y) => {
            // 現在の仕様では、StringParameterは他のパラメーターと異なりundefinedでも''と同じとみなされるため、それに合わせている。
            const xValue = x.character.state.strParams?.[key]?.value ?? '';
            const yValue = y.character.state.strParams?.[key]?.value ?? '';
            return xValue.localeCompare(yValue);
        },
        // eslint-disable-next-line react/display-name
        render: (_: unknown, { character, onOperateCharacter }: DataSource) => {
            return (
                <div className={classNames(flex, flexRow)}>
                    <OverriddenParameterNameEditor
                        type='table'
                        overriddenParameterName={
                            character.state.strParams?.[key]?.overriddenParameterName
                        }
                        onOverriddenParameterNameChange={newName =>
                            onOperateCharacter(character =>
                                produce(character, character => {
                                    const strParam = character.strParams?.[key];
                                    if (strParam == null) {
                                        return;
                                    }
                                    strParam.overriddenParameterName = newName;
                                })
                            )
                        }
                    />
                    <div style={{ paddingLeft: overriddenParameterNamePadding }} />
                    <StringParameterInput
                        compact
                        isCharacterPrivate={character.state.isPrivate}
                        isCreate={false}
                        parameterKey={key}
                        parameter={character.state.strParams?.[key]}
                        createdByMe={character.createdByMe ?? false}
                        onOperate={mapping => {
                            onOperateCharacter(mapping);
                        }}
                    />
                </div>
            );
        },
    };
};

const dndItemKey = 'rowKey';

type TableHeaderCellProps = {
    title: string;
    rowKey: string;
};

const TableHeaderCell: React.FC<TableHeaderCellProps> = ({
    title,
    rowKey,
}: TableHeaderCellProps) => {
    // キャラクターウィンドウは現時点では最大1個までしか存在しないため、静的な文字列で構わない
    const type = 'TableHeaderCell';

    const setRoomConfig = useImmerUpdateAtom(roomConfigAtom);
    const keySorter = React.useMemo(() => new KeySorter(RowKeys.all), []);

    const [, drag] = useDrag(
        {
            type,
            end: (_, monitor) => {
                const dropResult = monitor.getDropResult();
                const draggedItemRowKey = (dropResult as any)?.[dndItemKey] as string | undefined;
                if (draggedItemRowKey == null) {
                    return;
                }
                setRoomConfig(roomConfig => {
                    if (roomConfig == null) {
                        return;
                    }
                    const newRowKeysOrder = keySorter.move(
                        roomConfig.panels.characterPanel.rowKeysOrder,
                        { from: rowKey, to: draggedItemRowKey }
                    );
                    if (newRowKeysOrder != null) {
                        roomConfig.panels.characterPanel.rowKeysOrder = newRowKeysOrder;
                    }
                });
            },
        },
        [setRoomConfig, rowKey]
    );
    const [, drop] = useDrop({
        accept: type,
        drop: () => ({ [dndItemKey]: rowKey }),
    });
    return (
        <div ref={drop}>
            {title}
            <Tooltip
                overlayClassName={cancelRnd}
                overlay={
                    <div
                        onClick={e => {
                            // これがないと、overlayをクリックしたときでもTableがソートされてしまう
                            e.stopPropagation();
                        }}
                    >
                        左右にドラッグすることで列を移動できます。
                    </div>
                }
            >
                <Button
                    ref={drag}
                    style={{ cursor: 'move' }}
                    type='text'
                    size='small'
                    onClick={e => e.stopPropagation()}
                >
                    <Icon.MenuOutlined />
                </Button>
            </Tooltip>
        </div>
    );
};

type CharacterListTabPaneProps = {
    tabConfig: CharacterTabConfig;
};

const CharacterListTabPane: React.FC<CharacterListTabPaneProps> = ({
    tabConfig,
}: CharacterListTabPaneProps) => {
    const myUserUid = useMyUserUid();
    const setRoomState = useSetRoomStateWithImmer();
    const setCharacterEditorModal = useUpdateAtom(characterEditorModalAtom);

    const characters = useCharacters(tabConfig);
    const boolParamNames = useBoolParamNames();
    const numParamNames = useNumParamNames();
    const strParamNames = useStrParamNames();

    const rowKeysOrderSource = useAtomSelector(
        roomConfigAtom,
        roomConfig => roomConfig?.panels.characterPanel.rowKeysOrder
    );
    const rowKeysOrder = React.useMemo(
        () => new KeySorter(RowKeys.all).generate(rowKeysOrderSource ?? []),
        [rowKeysOrderSource]
    );
    const columns: ColumnType<DataSource>[] | null = React.useMemo(() => {
        if (boolParamNames == null || numParamNames == null || strParamNames == null) {
            return null;
        }

        return rowKeysOrder
            .map<ColumnType<DataSource> | null>(rowKey => {
                switch (rowKey) {
                    case RowKeys.EditButton:
                        return {
                            title: <TableHeaderCell title='' rowKey={rowKey} />,
                            key: 'menu',
                            width: 36,
                            // eslint-disable-next-line react/display-name
                            render: (_: unknown, { character }: DataSource) => (
                                <Tooltip title='編集'>
                                    <Button
                                        style={{ alignSelf: 'center' }}
                                        size='small'
                                        onClick={() =>
                                            setCharacterEditorModal({
                                                type: update,
                                                stateId: character.stateId,
                                                selectedPieceType: null,
                                            })
                                        }
                                    >
                                        <Icon.SettingOutlined />
                                    </Button>
                                </Tooltip>
                            ),
                        };
                    case RowKeys.Name:
                        return {
                            title: <TableHeaderCell title='名前' rowKey={rowKey} />,
                            key: 'name',
                            sorter: (x, y) =>
                                x.character.state.name.localeCompare(y.character.state.name),
                            // eslint-disable-next-line react/display-name
                            render: (_: unknown, { character }: DataSource) => (
                                <div className={classNames(flex, flexRow, itemsCenter)}>
                                    {character.state.image == null ? (
                                        <Icon.UserOutlined />
                                    ) : (
                                        <IconView size={20} image={character.state.image} />
                                    )}
                                    <div style={{ width: 4 }} />
                                    <CollaborativeInput
                                        style={{ minWidth: 100, width: '100%' }}
                                        bufferDuration='default'
                                        size='small'
                                        value={character.state.name}
                                        onChange={e => {
                                            if (e.previousValue === e.currentValue) {
                                                return;
                                            }
                                            setRoomState(state => {
                                                const targetCharacter =
                                                    state.characters?.[character.stateId];
                                                if (targetCharacter == null) {
                                                    return;
                                                }
                                                targetCharacter.name = e.currentValue;
                                            });
                                        }}
                                    />
                                </div>
                            ),
                        };
                    case RowKeys.TogglePrivate:
                        return {
                            title: <TableHeaderCell title='' rowKey={rowKey} />,
                            key: '全体公開',
                            sorter: (x, y) =>
                                (x.character.state.isPrivate ? 1 : 0) -
                                (y.character.state.isPrivate ? 1 : 0),
                            width: 36,
                            // eslint-disable-next-line react/display-name
                            render: (_: unknown, { character }: DataSource) => (
                                <ToggleButton
                                    size='small'
                                    checked={!character.state.isPrivate}
                                    disabled={
                                        character.createdByMe
                                            ? false
                                            : characterIsNotPrivateAndNotCreatedByMe
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
                                            const targetCharacter =
                                                roomState.characters?.[character.stateId];
                                            if (targetCharacter == null) {
                                                return;
                                            }
                                            targetCharacter.isPrivate = !newValue;
                                        });
                                    }}
                                    shape='circle'
                                    defaultType='dashed'
                                />
                            ),
                        };
                }
                const boolParamKey = RowKeys.isBoolParam(rowKey);
                if (boolParamKey != null) {
                    return createBooleanParameterColumn({ key: boolParamKey, boolParamNames });
                }
                const numParamKey = RowKeys.isNumParam(rowKey);
                if (numParamKey != null) {
                    return createNumberParameterColumn({ key: numParamKey, numParamNames });
                }
                const strParamKey = RowKeys.isStrParam(rowKey);
                if (strParamKey != null) {
                    return createStringParameterColumn({ key: strParamKey, strParamNames });
                }

                loggerRef.value.warn(
                    `"${rowKey}" は使用可能なキーではありません。KeySorterの設定に誤りがある可能性があります。`
                );
                return null;
            })
            .flatMap(x => (x == null ? [] : [x]));
    }, [
        boolParamNames,
        numParamNames,
        rowKeysOrder,
        setCharacterEditorModal,
        setRoomState,
        strParamNames,
    ]);

    const charactersDataSource: DataSource[] = React.useMemo(() => {
        const operateCharacter =
            (characterId: string) => (mapping: (character: CharacterState) => CharacterState) => {
                setRoomState(roomState => {
                    const character = roomState.characters?.[characterId];
                    if (character == null) {
                        return;
                    }
                    if (roomState.characters == null) {
                        roomState.characters = {};
                    }
                    roomState.characters[characterId] = mapping(character);
                });
            };

        return [...characters].map(([characterId, character]) => {
            const createdByMe = myUserUid != null && myUserUid === character.ownerParticipantId;
            return {
                key: characterId, // antdのtableのkeyとして必要
                character: {
                    stateId: characterId,
                    state: character,
                    createdByMe,
                },
                onOperateCharacter: operateCharacter(characterId),
            };
        });
    }, [characters, myUserUid, setRoomState]);

    if (columns == null) {
        return null;
    }

    return (
        <AntdTable
            columns={columns}
            dataSource={charactersDataSource}
            size='small'
            pagination={false}
            // 列をドラッグして動かすときにTooltipをドラッグするとキャラクターウィンドウが開いてしまう。簡単な方法でTooltipを調整する手段はなさそうなので、非表示にすることで解決している
            showSorterTooltip={false}
        />
    );
};

type TabEditorModalProps = {
    // これがundefinedの場合、Modalのvisibleがfalseとみなされる。
    config?: CharacterTabConfig;

    onChange: (immerRecipe: (config: CharacterTabConfig) => void) => void;
    onClose: () => void;
};

const TabEditorModal: React.FC<TabEditorModalProps> = (props: TabEditorModalProps) => {
    const { config, onChange, onClose } = props;

    const characterTagNames = useCharacterTagNames();

    const tagCheckBoxes: React.ReactNode[] = [];
    strIndex10Array.forEach(index => {
        if (config == null) {
            return;
        }
        const key = `showTag${index}` as const;
        const tagName = characterTagNames?.[`characterTag${index}Name`];
        if (tagName == null) {
            return;
        }
        tagCheckBoxes.push(
            <React.Fragment key={index}>
                <Checkbox
                    checked={config[key] ?? false}
                    onChange={e =>
                        onChange(config => {
                            config[key] = e.target.checked;
                        })
                    }
                >
                    <span>{tagName}</span>
                </Checkbox>
                <br />
            </React.Fragment>
        );
    });

    return (
        <Modal
            open={config != null}
            title='タブの編集'
            closable
            onCancel={() => onClose()}
            width={500}
            footer={
                <DialogFooter
                    close={{
                        textType: 'close',
                        onClick: () => onClose(),
                    }}
                />
            }
        >
            <Table>
                <TableRow label='タブ名'>
                    <Input
                        value={config?.tabName ?? ''}
                        onChange={e =>
                            onChange(config => {
                                config.tabName = e.target.value;
                            })
                        }
                    />
                    {config?.tabName ?? '' !== '' ? null : (
                        <>
                            <br />
                            <Alert
                                type='info'
                                showIcon
                                message='タブ名が空白であるため、自動的に決定された名前が表示されます。'
                            />
                        </>
                    )}
                </TableRow>
                <TableDivider />
                <TableRow>
                    <Checkbox
                        checked={config?.showNoTag ?? false}
                        onChange={e =>
                            onChange(config => {
                                config.showNoTag = e.target.checked;
                            })
                        }
                    >
                        <span>タグのないキャラクター</span>
                    </Checkbox>
                </TableRow>
                <TableDivider dashed />
                <TableRow>{tagCheckBoxes}</TableRow>
            </Table>
        </Modal>
    );
};

const CharacterListPanelWithPanelId: React.FC<{
    // 複数のCharacterListが存在する場合は、panelIdをそれぞれ異なるものにする。
    panelId: string;
}> = ({ panelId }) => {
    const tabs = useAtomSelector(
        roomConfigAtom,
        roomConfig => roomConfig?.panels.characterPanel.tabs
    );
    const setRoomConfig = useImmerUpdateAtom(roomConfigAtom);
    const setCharacterParameterNamesEditorVisibility = useUpdateAtom(
        characterParameterNamesEditorVisibilityAtom
    );
    const setCharacterTagNamesEditorVisibility = useUpdateAtom(
        characterTagNamesEditorVisibilityAtom
    );
    const setCharacterEditorModal = useUpdateAtom(characterEditorModalAtom);
    const setImportCharacterModal = useUpdateAtom(importCharacterModalVisibilityAtom);
    const [editingTabConfigKey, setEditingTabConfigKey] = React.useState<string | undefined>();

    return React.useMemo(() => {
        const tabItems = (tabs ?? []).map((tab, tabIndex) => {
            const result: AntdTab = {
                key: tab.key,
                tabKey: tab.key,
                style: { overflowY: 'scroll' },
                closable: false,
                label: (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyItems: 'center',
                        }}
                    >
                        <div style={{ flex: '0 0 auto', maxWidth: 100 }}>
                            <CharacterTabName tabConfig={tab} />
                        </div>
                        <div style={{ flex: 1 }} />
                        <div style={{ flex: '0 0 auto', paddingLeft: 15 }}>
                            <Dropdown
                                trigger={['click']}
                                overlay={
                                    <Menu
                                        items={[
                                            {
                                                key: `編集@${panelId}@CharacterList`,
                                                icon: <Icon.SettingOutlined />,
                                                label: '編集',
                                                onClick: () => setEditingTabConfigKey(tab.key),
                                            },
                                            {
                                                key: `削除@${panelId}@CharacterList`,
                                                icon: <Icon.DeleteOutlined />,
                                                label: '削除',
                                                onClick: () =>
                                                    Modal.warn({
                                                        onOk: () => {
                                                            setRoomConfig(roomConfig => {
                                                                if (roomConfig == null) {
                                                                    return;
                                                                }
                                                                roomConfig.panels.characterPanel.tabs.splice(
                                                                    tabIndex,
                                                                    1
                                                                );
                                                            });
                                                        },
                                                        okCancel: true,
                                                        maskClosable: true,
                                                        closable: true,
                                                        content:
                                                            'タブを削除します。よろしいですか？',
                                                    }),
                                            },
                                        ]}
                                        triggerSubMenuAction={defaultTriggerSubMenuAction}
                                    />
                                }
                            >
                                <Button
                                    style={{
                                        width: 18,
                                        minWidth: 18,

                                        // antdのButtonはCSS(.antd-btn-sm)によって padding: 0px 7px が指定されているため、左右に空白ができる。ここではこれを無効化するため、paddingを上書きしている。
                                        padding: '0 2px',
                                    }}
                                    type='text'
                                    size='small'
                                    onClick={e => e.stopPropagation()}
                                >
                                    <Icon.EllipsisOutlined />
                                </Button>
                            </Dropdown>
                        </div>
                    </div>
                ),
                children: <CharacterListTabPane tabConfig={tab} />,
            };
            return result;
        });

        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    margin: '2px 4px',
                }}
            >
                <div style={{ paddingBottom: 8 }}>
                    <TabEditorModal
                        config={tabs?.find(tab => tab.key === editingTabConfigKey)}
                        onClose={() => setEditingTabConfigKey(undefined)}
                        onChange={recipe => {
                            if (editingTabConfigKey == null) {
                                return;
                            }
                            setRoomConfig(roomConfig => {
                                if (roomConfig == null) {
                                    return;
                                }
                                const targetTabConfig = roomConfig.panels.characterPanel.tabs.find(
                                    tab => tab.key === editingTabConfigKey
                                );
                                if (targetTabConfig == null) {
                                    return;
                                }
                                recipe(targetTabConfig);
                            });
                        }}
                    />
                    <Button size='small' onClick={() => setCharacterEditorModal({ type: create })}>
                        キャラクターを作成
                    </Button>
                    <Button size='small' onClick={() => setImportCharacterModal(true)}>
                        キャラクターをインポート
                    </Button>
                    <Button
                        size='small'
                        onClick={() => setCharacterParameterNamesEditorVisibility(true)}
                    >
                        パラメーターを追加・編集・削除
                    </Button>
                    <Button size='small' onClick={() => setCharacterTagNamesEditorVisibility(true)}>
                        タグを追加・編集・削除
                    </Button>
                </div>
                <DraggableTabs
                    items={tabItems}
                    // キャラクターウィンドウは最大で1個までしか存在しないため、静的な値で構わない
                    dndType='CharacterListTabs'
                    type='editable-card'
                    onDnd={action => {
                        setRoomConfig(roomConfig => {
                            if (roomConfig == null) {
                                return;
                            }
                            moveElement(
                                roomConfig.panels.characterPanel.tabs,
                                tab => tab.key,
                                action
                            );
                        });
                    }}
                    onEdit={(e, type) => {
                        if (type === 'remove') {
                            if (typeof e !== 'string') {
                                return;
                            }
                            setRoomConfig(roomConfig => {
                                if (roomConfig == null) {
                                    return;
                                }
                                const indexToSplice =
                                    roomConfig.panels.characterPanel.tabs.findIndex(
                                        tab => tab.key === e
                                    );
                                if (indexToSplice >= 0) {
                                    roomConfig.panels.characterPanel.tabs.splice(indexToSplice, 1);
                                }
                            });
                            return;
                        }
                        setRoomConfig(roomConfig => {
                            if (roomConfig == null) {
                                return;
                            }
                            roomConfig.panels.characterPanel.tabs.push(
                                CharacterTabConfigUtils.createEmpty({})
                            );
                        });
                    }}
                />
            </div>
        );
    }, [
        editingTabConfigKey,
        panelId,
        setCharacterEditorModal,
        setCharacterParameterNamesEditorVisibility,
        setCharacterTagNamesEditorVisibility,
        setImportCharacterModal,
        setRoomConfig,
        tabs,
    ]);
};

export const CharacterListPanelContent: React.FC = () => {
    // 現状ではCharacterListは最大でも1つしか存在しないため、panelIdは適当で構わない
    return <CharacterListPanelWithPanelId panelId='CharacterList' />;
};
