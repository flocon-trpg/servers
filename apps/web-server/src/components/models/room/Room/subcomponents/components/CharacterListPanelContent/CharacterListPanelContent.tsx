/** @jsxImportSource @emotion/react */
import React from 'react';
import {
    Alert,
    Table as AntdTable,
    Button,
    Checkbox,
    Dropdown,
    Input,
    Menu,
    Modal,
    Tabs,
    Tooltip,
} from 'antd';
import { update } from '@/stateManagers/states/types';
import { NumberParameterInput } from '../NumberParameterInput/NumberParameterInput';
import { BooleanParameterInput } from '../BooleanParameterInput/BooleanParameterInput';
import { StringParameterInput } from '../StringParameterInput/StringParameterInput';
import * as Icon from '@ant-design/icons';
import { ToggleButton } from '@/components/ui/ToggleButton/ToggleButton';
import {
    characterIsNotPrivate,
    characterIsNotPrivateAndNotCreatedByMe,
    characterIsPrivate,
} from '@/resources/text/main';
import { useCharacters } from '../../hooks/useCharacters';
import { useBoolParamNames, useNumParamNames, useStrParamNames } from '../../hooks/useParamNames';
import {
    State,
    StrIndex20,
    characterTemplate,
    paramNameTemplate,
    strIndex10Array,
} from '@flocon-trpg/core';
import classNames from 'classnames';
import { cancelRnd, flex, flexRow, itemsCenter } from '@/styles/className';
import { ColumnType } from 'antd/lib/table';
import { SortOrder } from 'antd/lib/table/interface';
import { IconView } from '../../../../../file/IconView/IconView';
import { useSetRoomStateWithImmer } from '@/hooks/useSetRoomStateWithImmer';
import { create } from '@/utils/constants';
import { useUpdateAtom } from 'jotai/utils';
import { characterEditorModalAtom } from '../CharacterEditorModal/CharacterEditorModal';
import { OverriddenParameterNameEditor } from '../OverriddenParameterNameEditor/OverriddenParameterNameEditor';
import produce from 'immer';
import { characterParameterNamesEditorVisibilityAtom } from '../CharacterParameterNamesEditorModal/CharacterParameterNamesEditorModal';
import { useMyUserUid } from '@/hooks/useMyUserUid';
import { characterTagNamesEditorVisibilityAtom } from '../CharacterTagNamesEditorModal/CharacterTagNamesEditorModal';
import { CharacterTabConfig } from '@/atoms/roomConfigAtom/types/characterTabConfig';
import { useAtomSelector } from '@/hooks/useAtomSelector';
import { roomConfigAtom } from '@/atoms/roomConfigAtom/roomConfigAtom';
import { CharacterTabName } from './subcomponents/components/CharacterTabName/CharacterTabName';
import { useImmerUpdateAtom } from '@/hooks/useImmerUpdateAtom';
import { CharacterTabConfigUtils } from '@/atoms/roomConfigAtom/types/characterTabConfig/utils';
import { DialogFooter } from '@/components/ui/DialogFooter/DialogFooter';
import { useCharacterTagNames } from '../../hooks/useCharacterTagNames';
import { importCharacterModalVisibilityAtom } from '../ImportCharacterModal/ImportCharacterModal';
import { useDrag, useDrop } from 'react-dnd';
import { KeySorter } from '@/utils/keySorter';
import { RowKeys } from '@/atoms/roomConfigAtom/types/charactersPanelConfig';
import { DraggableTabs } from '@/components/ui/DraggableTabs/DraggableTabs';
import { moveElement } from '@/utils/moveElement';
import { defaultTriggerSubMenuAction } from '@/utils/variables';
import { Table, TableDivider, TableRow } from '@/components/ui/Table/Table';

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
            // ????????????????????????StringParameter???????????????????????????????????????undefined??????''??????????????????????????????????????????????????????????????????
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
    // ?????????????????????????????????????????????????????????1????????????????????????????????????????????????????????????????????????
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
                            // ?????????????????????overlay?????????????????????????????????Table??????????????????????????????
                            e.stopPropagation();
                        }}
                    >
                        ???????????????????????????????????????????????????????????????
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
                                <Tooltip title='??????'>
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
                            title: <TableHeaderCell title='??????' rowKey={rowKey} />,
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
                                    <Input
                                        style={{ minWidth: 100 }}
                                        value={character.state.name}
                                        size='small'
                                        onChange={newValue => {
                                            setRoomState(state => {
                                                const targetCharacter =
                                                    state.characters?.[character.stateId];
                                                if (targetCharacter == null) {
                                                    return;
                                                }
                                                targetCharacter.name = newValue.target.value;
                                            });
                                        }}
                                    />
                                </div>
                            ),
                        };
                    case RowKeys.TogglePrivate:
                        return {
                            title: <TableHeaderCell title='' rowKey={rowKey} />,
                            key: '????????????',
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

                console.warn(
                    `"${rowKey}" ????????????????????????????????????????????????KeySorter??????????????????????????????????????????????????????`
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
                key: characterId, // antd???table???key???????????????
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
            // ??????????????????????????????????????????Tooltip???????????????????????????????????????????????????????????????????????????????????????????????????Tooltip?????????????????????????????????????????????????????????????????????????????????????????????
            showSorterTooltip={false}
        />
    );
};

type TabEditorModalProps = {
    // ?????????undefined????????????Modal???visible???false?????????????????????
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
            visible={config != null}
            title='???????????????'
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
                <TableRow label='?????????'>
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
                                message='?????????????????????????????????????????????????????????????????????????????????????????????'
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
                        <span>?????????????????????????????????</span>
                    </Checkbox>
                </TableRow>
                <TableDivider dashed />
                <TableRow>{tagCheckBoxes}</TableRow>
            </Table>
        </Modal>
    );
};

const CharacterListPanelWithPanelId: React.FC<{
    // ?????????CharacterList???????????????????????????panelId??????????????????????????????????????????
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
        const tabPanes = (tabs ?? []).map((tab, tabIndex) => {
            return (
                <Tabs.TabPane
                    key={tab.key}
                    tabKey={tab.key}
                    style={{ overflowY: 'scroll' }}
                    closable={false}
                    tab={
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
                                                    key: `??????@${panelId}@CharacterList`,
                                                    icon: <Icon.SettingOutlined />,
                                                    label: '??????',
                                                    onClick: () => setEditingTabConfigKey(tab.key),
                                                },
                                                {
                                                    key: `??????@${panelId}@CharacterList`,
                                                    icon: <Icon.DeleteOutlined />,
                                                    label: '??????',
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
                                                                '???????????????????????????????????????????????????',
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

                                            // antd???Button???CSS(.antd-btn-sm)???????????? padding: 0px 7px ????????????????????????????????????????????????????????????????????????????????????????????????????????????padding???????????????????????????
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
                    }
                >
                    <CharacterListTabPane tabConfig={tab} />
                </Tabs.TabPane>
            );
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
                        ???????????????????????????
                    </Button>
                    <Button size='small' onClick={() => setImportCharacterModal(true)}>
                        ????????????????????????????????????
                    </Button>
                    <Button
                        size='small'
                        onClick={() => setCharacterParameterNamesEditorVisibility(true)}
                    >
                        ?????????????????????????????????????????????
                    </Button>
                    <Button size='small' onClick={() => setCharacterTagNamesEditorVisibility(true)}>
                        ?????????????????????????????????
                    </Button>
                </div>
                <DraggableTabs
                    // ?????????????????????????????????????????????1??????????????????????????????????????????????????????????????????
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
                >
                    {tabPanes}
                </DraggableTabs>
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
    // ????????????CharacterList???????????????1?????????????????????????????????panelId????????????????????????
    return <CharacterListPanelWithPanelId panelId='CharacterList' />;
};
