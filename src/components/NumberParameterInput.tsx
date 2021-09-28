import React from 'react';
import { Button, Input, InputNumber, Tooltip } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import ToggleButton from './ToggleButton';
import {
    addParameter,
    deleteParameter,
    parameterIsPrivate,
    parameterIsNotPrivate,
    parameterIsPrivateAndNotCreatedByMe,
    parameterIsNotPrivateAndNotCreatedByMe,
} from '../resource/text/main';
import { CharacterUpOperation, NumParamState, StrIndex20 } from '@kizahasi/flocon-core';

const inputWidth = 50;

type Props = {
    isCharacterPrivate: boolean;
    isCreate: boolean;
    parameterKey: StrIndex20;
    numberParameter: NumParamState | undefined;
    numberMaxParameter: NumParamState | undefined;
    createdByMe: boolean;
    onOperate: (operation: CharacterUpOperation) => void;
    compact: boolean;
};

const disabledInput = <Input style={{ width: inputWidth }} disabled value='?' size='small' />;

const NumberParameterInput: React.FC<Props> = ({
    isCharacterPrivate,
    isCreate,
    parameterKey,
    numberParameter,
    numberMaxParameter,
    createdByMe,
    onOperate,
    compact,
}: Props) => {
    const addOrDeleteNumberParameterButton = ({
        disabled,
    }: {
        disabled: boolean;
    }): JSX.Element | null => {
        if (compact) {
            return null;
        }
        if (numberParameter?.value == null) {
            return (
                <Tooltip title={addParameter}>
                    <Button
                        size='small'
                        disabled={disabled}
                        onClick={() => {
                            const operation: CharacterUpOperation = {
                                $v: 2,
                                numParams: {
                                    [parameterKey]: {
                                        $v: 1,
                                        value: { newValue: 0 },
                                    },
                                },
                            };
                            onOperate(operation);
                        }}
                    >
                        <PlusOutlined />
                    </Button>
                </Tooltip>
            );
        }
        return (
            <Tooltip title={deleteParameter}>
                <Button
                    size='small'
                    disabled={disabled}
                    onClick={() => {
                        const operation: CharacterUpOperation = {
                            $v: 2,
                            numParams: {
                                [parameterKey]: {
                                    $v: 1,
                                    value: { newValue: undefined },
                                },
                            },
                        };
                        onOperate(operation);
                    }}
                >
                    <DeleteOutlined />
                </Button>
            </Tooltip>
        );
    };

    const addOrDeleteNumberMaxParameterButton = ({
        disabled,
    }: {
        disabled: boolean;
    }): JSX.Element | null => {
        if (compact) {
            return null;
        }
        if (numberMaxParameter?.value == null) {
            return (
                <Tooltip title={addParameter}>
                    <Button
                        size='small'
                        disabled={disabled}
                        onClick={() => {
                            const operation: CharacterUpOperation = {
                                $v: 2,
                                numMaxParams: {
                                    [parameterKey]: {
                                        $v: 1,
                                        value: { newValue: 0 },
                                    },
                                },
                            };
                            onOperate(operation);
                        }}
                    >
                        <PlusOutlined />
                    </Button>
                </Tooltip>
            );
        }
        return (
            <Tooltip title={deleteParameter}>
                <Button
                    size='small'
                    disabled={disabled}
                    onClick={() => {
                        const operation: CharacterUpOperation = {
                            $v: 2,
                            numMaxParams: {
                                [parameterKey]: {
                                    $v: 1,
                                    value: { newValue: undefined },
                                },
                            },
                        };
                        onOperate(operation);
                    }}
                >
                    <DeleteOutlined />
                </Button>
            </Tooltip>
        );
    };

    const numberParameterInput = (() => {
        if (!createdByMe && numberParameter?.isValuePrivate === true) {
            if (compact) {
                return (
                    <Tooltip title={parameterIsPrivateAndNotCreatedByMe}>
                        <EyeInvisibleOutlined />
                    </Tooltip>
                );
            }
            return (
                <>
                    {disabledInput}
                    {addOrDeleteNumberParameterButton({ disabled: true })}
                    <Tooltip title={parameterIsPrivateAndNotCreatedByMe}>
                        <EyeInvisibleOutlined />
                    </Tooltip>
                </>
            );
        }
        const isPrivateButton = (
            <ToggleButton
                checked={!(numberParameter?.isValuePrivate ?? false)}
                disabled={createdByMe ? false : parameterIsNotPrivateAndNotCreatedByMe}
                hideWhenDisabled={compact}
                showAsTextWhenDisabled={!compact}
                tooltip={
                    numberParameter?.isValuePrivate ?? false
                        ? parameterIsPrivate({ isCharacterPrivate, isCreate })
                        : parameterIsNotPrivate({ isCharacterPrivate, isCreate })
                }
                checkedChildren={<EyeOutlined />}
                unCheckedChildren={<EyeInvisibleOutlined />}
                size='small'
                onChange={e => {
                    const operation: CharacterUpOperation = {
                        $v: 2,
                        numParams: {
                            [parameterKey]: {
                                $v: 1,
                                isValuePrivate: { newValue: !e },
                            },
                        },
                    };
                    onOperate(operation);
                }}
            />
        );
        if (numberParameter?.value == null) {
            if (compact) {
                return null;
            }
            return (
                <>
                    {disabledInput}
                    {addOrDeleteNumberParameterButton({ disabled: false })}
                    {isPrivateButton}
                </>
            );
        }
        return (
            <>
                <InputNumber
                    style={{ width: inputWidth }}
                    size='small'
                    disabled={numberParameter?.value == null}
                    value={numberParameter?.value ?? 0}
                    onChange={newValue => {
                        if (typeof newValue !== 'number') {
                            return;
                        }
                        const operation: CharacterUpOperation = {
                            $v: 2,
                            numParams: {
                                [parameterKey]: {
                                    $v: 1,
                                    value: { newValue },
                                },
                            },
                        };
                        onOperate(operation);
                    }}
                />
                {addOrDeleteNumberParameterButton({ disabled: false })}
                {isPrivateButton}
            </>
        );
    })();
    const numberMaxParameterInput = (() => {
        if (!createdByMe && numberMaxParameter?.isValuePrivate === true) {
            if (compact) {
                return (
                    <Tooltip title={parameterIsPrivateAndNotCreatedByMe}>
                        <EyeInvisibleOutlined />
                    </Tooltip>
                );
            }
            return (
                <>
                    {disabledInput}
                    {addOrDeleteNumberMaxParameterButton({ disabled: true })}
                    <Tooltip title={parameterIsPrivateAndNotCreatedByMe}>
                        <EyeInvisibleOutlined />
                    </Tooltip>
                </>
            );
        }
        const isPrivateButton = (
            <ToggleButton
                checked={!(numberMaxParameter?.isValuePrivate ?? false)}
                disabled={createdByMe ? false : parameterIsNotPrivateAndNotCreatedByMe}
                hideWhenDisabled={compact}
                showAsTextWhenDisabled={!compact}
                tooltip={
                    numberMaxParameter?.isValuePrivate ?? false
                        ? parameterIsPrivate({ isCharacterPrivate, isCreate })
                        : parameterIsNotPrivate({ isCharacterPrivate, isCreate })
                }
                checkedChildren={<EyeOutlined />}
                unCheckedChildren={<EyeInvisibleOutlined />}
                size='small'
                onChange={e => {
                    const operation: CharacterUpOperation = {
                        $v: 2,
                        numMaxParams: {
                            [parameterKey]: {
                                $v: 1,
                                isValuePrivate: { newValue: !e },
                            },
                        },
                    };
                    onOperate(operation);
                }}
            />
        );
        if (numberMaxParameter?.value == null) {
            if (compact) {
                return null;
            }
            return (
                <>
                    {disabledInput}
                    {addOrDeleteNumberMaxParameterButton({ disabled: false })}
                    {isPrivateButton}
                </>
            );
        }
        return (
            <>
                <InputNumber
                    style={{ width: inputWidth }}
                    size='small'
                    disabled={numberMaxParameter.value == null}
                    value={numberMaxParameter?.value ?? 0}
                    onChange={newValue => {
                        if (typeof newValue !== 'number') {
                            return;
                        }
                        const operation: CharacterUpOperation = {
                            $v: 2,
                            numMaxParams: {
                                [parameterKey]: {
                                    $v: 1,
                                    value: { newValue },
                                },
                            },
                        };
                        onOperate(operation);
                    }}
                />
                {addOrDeleteNumberMaxParameterButton({ disabled: false })}
                {isPrivateButton}
            </>
        );
    })();

    return (
        <div style={{ whiteSpace: 'nowrap' }}>
            {numberParameterInput}
            {numberParameterInput == null && numberMaxParameterInput != null ? disabledInput : null}
            {numberMaxParameterInput == null ? null : <span> / </span>}
            {numberMaxParameterInput}
        </div>
    );
};

export default NumberParameterInput;
