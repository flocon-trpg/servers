import { Button, Collapse, Form, Modal, Select, Space } from 'antd';
import React from 'react';
import { DialogFooter } from '@/components/ui/DialogFooter/DialogFooter';
import { replace } from '@/stateManagers/states/types';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useSetRoomStateByApply } from '@/hooks/useSetRoomStateByApply';
import { recordToMap } from '@flocon-trpg/utils';
import { StrIndex20, UpOperation as U, roomTemplate, strIndex20Array } from '@flocon-trpg/core';
import { InputModal } from '@/components/ui/InputModal/InputModal';
import classNames from 'classnames';
import { flex, flexRow } from '@/styles/className';
import { useSetRoomStateWithImmer } from '@/hooks/useSetRoomStateWithImmer';
import { roomAtom } from '@/atoms/roomAtom/roomAtom';
import { useAtomSelector } from '@/hooks/useAtomSelector';
import { atom, useAtom } from 'jotai';
import { CollaborativeInput } from '@/components/ui/CollaborativeInput/CollaborativeInput';

type UpOperation = U<typeof roomTemplate>;

export const characterParameterNamesEditorVisibilityAtom = atom(false);

type VisibleParameterForm = {
    type: 'Bool' | 'Str' | 'Num';
    key: StrIndex20;
};

export const CharacterParameterNamesEditorModal: React.FC = () => {
    const [editorVisibility, setEditorVisibility] = useAtom(
        characterParameterNamesEditorVisibilityAtom
    );
    const operate = useSetRoomStateByApply();
    const setRoomState = useSetRoomStateWithImmer();
    const [visibleParameterForm, setVisibleParameterForm] = React.useState<VisibleParameterForm>();
    const [addNumParamSelector, setAddNumParamSelector] = React.useState<StrIndex20>();
    const [addBoolParamSelector, setAddBoolParamSelector] = React.useState<StrIndex20>();
    const [addStrParamSelector, setAddStrParamSelector] = React.useState<StrIndex20>();
    const boolParamNames = useAtomSelector(
        roomAtom,
        state => state.roomState?.state?.boolParamNames
    );
    const numParamNames = useAtomSelector(roomAtom, state => state.roomState?.state?.numParamNames);
    const strParamNames = useAtomSelector(roomAtom, state => state.roomState?.state?.strParamNames);

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
                type = '??????';
                break;
            case 'Bool':
                type = '?????????????????????';
                break;
            case 'Str':
                type = '?????????';
                break;
        }
        return `${type}??????????????????${visibleParameterForm.key}??????????????????`;
    })();

    const formItemStyle: React.CSSProperties = { margin: 0 }; // margin-bottom?????????????????????(24px)???????????????????????????

    const createNumParamName = (key: StrIndex20) => {
        const state = numParamNamesMap.get(key);
        if (state == null) {
            return null;
        }
        return (
            <Form.Item
                key={`numParameter${key}`}
                style={formItemStyle}
                label={`????????????????????????${key}`}
                name={`numParameter${key}`}
            >
                <Space>
                    <CollaborativeInput
                        size='small'
                        value={state.name}
                        bufferDuration={200}
                        onChange={e => {
                            if (e.previousValue === e.currentValue) {
                                return;
                            }
                            setRoomState(state => {
                                const targetNumParamName = state.numParamNames?.[key];
                                if (targetNumParamName == null) {
                                    return;
                                }
                                targetNumParamName.name = e.currentValue;
                            });
                        }}
                    />
                    <Button
                        size='small'
                        onClick={() => {
                            const operation: UpOperation = {
                                $v: 2,
                                $r: 1,
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
                label={`???????????????????????????????????????${key}`}
                name={`boolParameter${key}`}
            >
                <Space>
                    <CollaborativeInput
                        size='small'
                        value={state.name}
                        bufferDuration={200}
                        onChange={e => {
                            if (e.previousValue === e.currentValue) {
                                return;
                            }
                            setRoomState(state => {
                                const targetBoolParamName = state.boolParamNames?.[key];
                                if (targetBoolParamName == null) {
                                    return;
                                }
                                targetBoolParamName.name = e.currentValue;
                            });
                        }}
                    />
                    <Button
                        size='small'
                        onClick={() => {
                            const operation: UpOperation = {
                                $v: 2,
                                $r: 1,
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
                label={`???????????????????????????${key}`}
                name={`strParameter${key}`}
            >
                <Space>
                    <CollaborativeInput
                        size='small'
                        value={state.name}
                        bufferDuration={200}
                        onChange={e => {
                            if (e.previousValue === e.currentValue) {
                                return;
                            }
                            setRoomState(state => {
                                const targetStrParamName = state.strParamNames?.[key];
                                if (targetStrParamName == null) {
                                    return;
                                }
                                targetStrParamName.name = e.currentValue;
                            });
                        }}
                    />
                    <Button
                        size='small'
                        onClick={() => {
                            const operation: UpOperation = {
                                $v: 2,
                                $r: 1,
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
        <Modal
            title='?????????????????????????????????????????????????????????????????????'
            width={600}
            visible={editorVisibility}
            closable
            onCancel={() => setEditorVisibility(false)}
            footer={
                <DialogFooter
                    close={{
                        textType: 'close',
                        onClick: () => setEditorVisibility(false),
                    }}
                />
            }
        >
            <Form>
                <Collapse defaultActiveKey={['num', 'str', 'bool']}>
                    <Collapse.Panel header='????????????????????????' key='num'>
                        {strIndex20Array.map(createNumParamName)}
                        {strIndex20Array.some(key => numParamNamesMap.has(key)) ? (
                            <div style={{ padding: 6 }} />
                        ) : null}
                        <div className={classNames(flex, flexRow)}>
                            <Select
                                style={{ minWidth: 150 }}
                                size='small'
                                value={addNumParamSelector}
                                onChange={newValue => {
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
                                        >{`??????????????????${key}`}</Select.Option>
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
                                ??????
                            </Button>
                        </div>
                    </Collapse.Panel>
                    <Collapse.Panel header='???????????????????????????????????????' key='bool'>
                        {strIndex20Array.map(createBoolParamName)}
                        {strIndex20Array.some(key => boolParamNamesMap.has(key)) ? (
                            <div style={{ padding: 6 }} />
                        ) : null}
                        <div className={classNames(flex, flexRow)}>
                            <Select
                                style={{ minWidth: 150 }}
                                size='small'
                                value={addBoolParamSelector}
                                onChange={newValue => {
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
                                        >{`??????????????????${key}`}</Select.Option>
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
                                ??????
                            </Button>
                        </div>
                    </Collapse.Panel>
                    <Collapse.Panel header='???????????????????????????' key='str'>
                        {strIndex20Array.map(createStrParamName)}
                        {strIndex20Array.some(key => strParamNamesMap.has(key)) ? (
                            <div style={{ padding: 6 }} />
                        ) : null}
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Select
                                style={{ minWidth: 150 }}
                                size='small'
                                value={addStrParamSelector}
                                onChange={newValue => {
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
                                        >{`??????????????????${key}`}</Select.Option>
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
                                ??????
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
                                    $r: 1,
                                    boolParamNames: {
                                        [visibleParameterForm.key]: {
                                            type: replace,
                                            replace: {
                                                newValue: {
                                                    $v: 1,
                                                    $r: 1,
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
                                    $r: 1,
                                    numParamNames: {
                                        [visibleParameterForm.key]: {
                                            type: replace,
                                            replace: {
                                                newValue: {
                                                    $v: 1,
                                                    $r: 1,
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
                                    $r: 1,
                                    strParamNames: {
                                        [visibleParameterForm.key]: {
                                            type: replace,
                                            replace: {
                                                newValue: {
                                                    $v: 1,
                                                    $r: 1,
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
        </Modal>
    );
};
