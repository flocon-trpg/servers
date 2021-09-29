import { Button, Collapse, Drawer, Form, Input, Select, Space } from 'antd';
import React from 'react';
import DrawerFooter from '../../layouts/DrawerFooter';
import { replace, update } from '../../stateManagers/states/types';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import BufferedInput from '../../components/BufferedInput';
import { useSelector } from '../../store';
import { useOperate } from '../../hooks/useOperate';
import { recordToMap } from '@kizahasi/util';
import { StrIndex20, strIndex20Array, UpOperation } from '@kizahasi/flocon-core';
import { useDispatch } from 'react-redux';
import { roomDrawerAndPopoverAndModalModule } from '../../modules/roomDrawerAndPopoverAndModalModule';
import { InputModal } from '../../components/InputModal';
import classNames from 'classnames';
import { flex, flexRow } from '../../utils/className';

type VisibleParameterForm = {
    type: 'Bool' | 'Str' | 'Num';
    key: StrIndex20;
};

const CharacterParameterNamesDrawer: React.FC = () => {
    const characterParameterNamesDrawerVisibility = useSelector(
        state => state.roomDrawerAndPopoverAndModalModule.characterParameterNamesDrawerVisibility
    );
    const operate = useOperate();
    const dispatch = useDispatch();
    const [visibleParameterForm, setVisibleParameterForm] = React.useState<VisibleParameterForm>();
    const [addNumParamSelector, setAddNumParamSelector] = React.useState<StrIndex20>();
    const [addBoolParamSelector, setAddBoolParamSelector] = React.useState<StrIndex20>();
    const [addStrParamSelector, setAddStrParamSelector] = React.useState<StrIndex20>();
    const boolParamNames = useSelector(state => state.roomModule.roomState?.state?.boolParamNames);
    const numParamNames = useSelector(state => state.roomModule.roomState?.state?.numParamNames);
    const strParamNames = useSelector(state => state.roomModule.roomState?.state?.strParamNames);

    const boolParamNamesMap = React.useMemo(
        () => (boolParamNames == null ? undefined : recordToMap(boolParamNames)),
        [boolParamNames]
    );
    const numParamNamesMap = React.useMemo(
        () => (numParamNames == null ? undefined : recordToMap(numParamNames)),
        [numParamNames]
    );
    const strParamNamesMap = React.useMemo(
        () => (strParamNames == null ? undefined : recordToMap(strParamNames)),
        [strParamNames]
    );

    if (boolParamNamesMap == null || numParamNamesMap == null || strParamNamesMap == null) {
        return null;
    }

    const modalTitle = (() => {
        if (visibleParameterForm == null) {
            return '';
        }
        let type = '';
        switch (visibleParameterForm.type) {
            case 'Num':
                type = '数値';
                break;
            case 'Bool':
                type = 'チェックマーク';
                break;
            case 'Str':
                type = '文字列';
                break;
        }
        return `${type}パラメーター${visibleParameterForm.key}の名前を設定`;
    })();

    const formItemStyle: React.CSSProperties = { margin: 0 }; // margin-bottomのデフォルト値(24px)を上書きさせている

    const createNumParamName = (key: StrIndex20) => {
        const state = numParamNamesMap.get(key);
        if (state == null) {
            return null;
        }
        return (
            <Form.Item
                key={`numParameter${key}`}
                style={formItemStyle}
                label={`数値パラメーター${key}`}
                name={`numParameter${key}`}
            >
                <Space>
                    <BufferedInput
                        size='small'
                        value={state.name}
                        bufferDuration={200}
                        onChange={e => {
                            if (e.previousValue === e.currentValue) {
                                return;
                            }
                            const operation: UpOperation = {
                                $v: 2,
                                numParamNames: {
                                    [key]: {
                                        type: update,
                                        update: {
                                            $v: 1,
                                            name: { newValue: e.currentValue },
                                        },
                                    },
                                },
                            };
                            operate(operation);
                        }}
                    />
                    <Button
                        size='small'
                        onClick={() => {
                            const operation: UpOperation = {
                                $v: 2,
                                numParamNames: {
                                    [key]: {
                                        type: replace,
                                        replace: {
                                            newValue: undefined,
                                        },
                                    },
                                },
                            };
                            operate(operation);
                        }}
                    >
                        <DeleteOutlined />
                    </Button>
                </Space>
            </Form.Item>
        );
    };

    const createBoolParamName = (key: StrIndex20) => {
        const state = boolParamNamesMap.get(key);
        if (state == null) {
            return null;
        }
        return (
            <Form.Item
                key={`boolParameter${key}`}
                style={formItemStyle}
                label={`チェックマークパラメーター${key}`}
                name={`boolParameter${key}`}
            >
                <Space>
                    <BufferedInput
                        size='small'
                        value={state.name}
                        bufferDuration={200}
                        onChange={e => {
                            if (e.previousValue === e.currentValue) {
                                return;
                            }
                            const operation: UpOperation = {
                                $v: 2,
                                boolParamNames: {
                                    [key]: {
                                        type: update,
                                        update: {
                                            $v: 1,
                                            name: { newValue: e.currentValue },
                                        },
                                    },
                                },
                            };
                            operate(operation);
                        }}
                    />
                    <Button
                        size='small'
                        onClick={() => {
                            const operation: UpOperation = {
                                $v: 2,
                                boolParamNames: {
                                    [key]: {
                                        type: replace,
                                        replace: {
                                            newValue: undefined,
                                        },
                                    },
                                },
                            };
                            operate(operation);
                        }}
                    >
                        <DeleteOutlined />
                    </Button>
                </Space>
            </Form.Item>
        );
    };

    const createStrParamName = (key: StrIndex20) => {
        const state = strParamNamesMap.get(key);
        if (state == null) {
            return null;
        }
        return (
            <Form.Item
                key={`strParameter${key}`}
                style={formItemStyle}
                label={`文字列パラメーター${key}`}
                name={`strParameter${key}`}
            >
                <Space>
                    <BufferedInput
                        size='small'
                        value={state.name}
                        bufferDuration={200}
                        onChange={e => {
                            if (e.previousValue === e.currentValue) {
                                return;
                            }
                            const operation: UpOperation = {
                                $v: 2,
                                strParamNames: {
                                    [key]: {
                                        type: update,
                                        update: {
                                            $v: 1,
                                            name: { newValue: e.currentValue },
                                        },
                                    },
                                },
                            };
                            operate(operation);
                        }}
                    />
                    <Button
                        size='small'
                        onClick={() => {
                            const operation: UpOperation = {
                                $v: 2,
                                strParamNames: {
                                    [key]: {
                                        type: replace,
                                        replace: {
                                            newValue: undefined,
                                        },
                                    },
                                },
                            };
                            operate(operation);
                        }}
                    >
                        <DeleteOutlined />
                    </Button>
                </Space>
            </Form.Item>
        );
    };

    return (
        <Drawer
            title='キャラクターのパラメーター名の追加・編集・削除'
            width={600}
            visible={characterParameterNamesDrawerVisibility}
            closable
            onClose={() =>
                dispatch(
                    roomDrawerAndPopoverAndModalModule.actions.set({
                        characterParameterNamesDrawerVisibility: false,
                    })
                )
            }
            footer={
                <DrawerFooter
                    close={{
                        textType: 'close',
                        onClick: () =>
                            dispatch(
                                roomDrawerAndPopoverAndModalModule.actions.set({
                                    characterParameterNamesDrawerVisibility: false,
                                })
                            ),
                    }}
                />
            }
        >
            <Form>
                <Collapse defaultActiveKey={['num', 'str', 'bool']}>
                    <Collapse.Panel header='数値パラメーター' key='num'>
                        {strIndex20Array.map(createNumParamName)}
                        {strIndex20Array.some(key => numParamNamesMap.has(key)) ? (
                            <div style={{ padding: 6 }} />
                        ) : null}
                        <div className={classNames(flex, flexRow)}>
                            <Select
                                style={{ minWidth: 150 }}
                                size='small'
                                value={addNumParamSelector}
                                onSelect={newValue => {
                                    setAddNumParamSelector(newValue);
                                }}
                                onDeselect={() => {
                                    setAddNumParamSelector(undefined);
                                }}
                            >
                                {strIndex20Array.map(key => {
                                    const hasKey = numParamNamesMap.has(key);
                                    if (hasKey) {
                                        return null;
                                    }
                                    return (
                                        <Select.Option
                                            key={key}
                                            value={key}
                                        >{`パラメーター${key}`}</Select.Option>
                                    );
                                })}
                            </Select>
                            <Button
                                size='small'
                                disabled={addNumParamSelector == null}
                                icon={<PlusOutlined />}
                                onClick={() => {
                                    if (addNumParamSelector == null) {
                                        return;
                                    }
                                    const hasKey = numParamNamesMap.has(addNumParamSelector);
                                    if (hasKey) {
                                        return null;
                                    }
                                    setVisibleParameterForm({
                                        type: 'Num',
                                        key: addNumParamSelector,
                                    });
                                }}
                            >
                                追加
                            </Button>
                        </div>
                    </Collapse.Panel>
                    <Collapse.Panel header='チェックマークパラメーター' key='bool'>
                        {strIndex20Array.map(createBoolParamName)}
                        {strIndex20Array.some(key => boolParamNamesMap.has(key)) ? (
                            <div style={{ padding: 6 }} />
                        ) : null}
                        <div className={classNames(flex, flexRow)}>
                            <Select
                                style={{ minWidth: 150 }}
                                size='small'
                                value={addBoolParamSelector}
                                onSelect={newValue => {
                                    setAddBoolParamSelector(newValue);
                                }}
                                onDeselect={() => {
                                    setAddBoolParamSelector(undefined);
                                }}
                            >
                                {strIndex20Array.map(key => {
                                    const hasKey = boolParamNamesMap.has(key);
                                    if (hasKey) {
                                        return null;
                                    }
                                    return (
                                        <Select.Option
                                            key={key}
                                            value={key}
                                        >{`パラメーター${key}`}</Select.Option>
                                    );
                                })}
                            </Select>
                            <Button
                                size='small'
                                disabled={addBoolParamSelector == null}
                                icon={<PlusOutlined />}
                                onClick={() => {
                                    if (addBoolParamSelector == null) {
                                        return;
                                    }
                                    const hasKey = boolParamNamesMap.has(addBoolParamSelector);
                                    if (hasKey) {
                                        return null;
                                    }
                                    setVisibleParameterForm({
                                        type: 'Bool',
                                        key: addBoolParamSelector,
                                    });
                                }}
                            >
                                追加
                            </Button>
                        </div>
                    </Collapse.Panel>
                    <Collapse.Panel header='文字列パラメーター' key='str'>
                        {strIndex20Array.map(createStrParamName)}
                        {strIndex20Array.some(key => strParamNamesMap.has(key)) ? (
                            <div style={{ padding: 6 }} />
                        ) : null}
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Select
                                style={{ minWidth: 150 }}
                                size='small'
                                value={addStrParamSelector}
                                onSelect={newValue => {
                                    setAddStrParamSelector(newValue);
                                }}
                                onDeselect={() => {
                                    setAddStrParamSelector(undefined);
                                }}
                            >
                                {strIndex20Array.map(key => {
                                    const hasKey = strParamNamesMap.has(key);
                                    if (hasKey) {
                                        return null;
                                    }
                                    return (
                                        <Select.Option
                                            key={key}
                                            value={key}
                                        >{`パラメーター${key}`}</Select.Option>
                                    );
                                })}
                            </Select>
                            <Button
                                size='small'
                                disabled={addStrParamSelector == null}
                                icon={<PlusOutlined />}
                                onClick={() => {
                                    if (addStrParamSelector == null) {
                                        return;
                                    }
                                    const hasKey = strParamNamesMap.has(addStrParamSelector);
                                    if (hasKey) {
                                        return null;
                                    }
                                    setVisibleParameterForm({
                                        type: 'Str',
                                        key: addStrParamSelector,
                                    });
                                }}
                            >
                                追加
                            </Button>
                        </div>
                    </Collapse.Panel>
                </Collapse>
            </Form>
            {operate == null ? null : (
                <InputModal
                    title={modalTitle}
                    visible={visibleParameterForm != null}
                    isTextArea={false}
                    onOk={value => {
                        if (visibleParameterForm == null) {
                            return;
                        }
                        let operation: UpOperation;
                        switch (visibleParameterForm.type) {
                            case 'Bool':
                                operation = {
                                    $v: 2,
                                    boolParamNames: {
                                        [visibleParameterForm.key]: {
                                            type: replace,
                                            replace: {
                                                newValue: {
                                                    $v: 1,
                                                    name: value,
                                                },
                                            },
                                        },
                                    },
                                };
                                break;
                            case 'Num':
                                operation = {
                                    $v: 2,
                                    numParamNames: {
                                        [visibleParameterForm.key]: {
                                            type: replace,
                                            replace: {
                                                newValue: {
                                                    $v: 1,
                                                    name: value,
                                                },
                                            },
                                        },
                                    },
                                };
                                break;
                            case 'Str':
                                operation = {
                                    $v: 2,
                                    strParamNames: {
                                        [visibleParameterForm.key]: {
                                            type: replace,
                                            replace: {
                                                newValue: {
                                                    $v: 1,
                                                    name: value,
                                                },
                                            },
                                        },
                                    },
                                };
                                break;
                        }
                        operate(operation);
                        switch (visibleParameterForm.type) {
                            case 'Bool':
                                setAddBoolParamSelector(undefined);
                                break;
                            case 'Num':
                                setAddNumParamSelector(undefined);
                                break;
                            case 'Str':
                                setAddStrParamSelector(undefined);
                                break;
                        }
                        setVisibleParameterForm(undefined);
                    }}
                    disabled={value => value.trim() === ''}
                    onClose={() => setVisibleParameterForm(undefined)}
                />
            )}
        </Drawer>
    );
};

export default CharacterParameterNamesDrawer;
