import React from 'react';
import { Button, Input, InputNumber, Tooltip } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { ToggleButton } from '../../../ui/ToggleButton';
import {
    addParameter,
    deleteParameter,
    parameterIsPrivate,
    parameterIsNotPrivate,
    parameterIsPrivateAndNotCreatedByMe,
    parameterIsNotPrivateAndNotCreatedByMe,
} from '../../../../resource/text/main';
import {
    applyCharacter,
    CharacterState,
    CharacterUpOperation,
    NumParamState,
    StrIndex20,
} from '@flocon-trpg/core';

const inputWidth = 50;

type Props = {
    isCharacterPrivate: boolean;
    isCreate: boolean;
    parameterKey: StrIndex20;
    numberParameter: NumParamState | undefined;
    numberMaxParameter: NumParamState | undefined;
    createdByMe: boolean;
    onOperate: (mapping: (character: CharacterState) => CharacterState) => void;
    compact: boolean;
};

const disabledInput = <Input style={{ width: inputWidth }} disabled value='?' size='small' />;

export const NumberParameterInput: React.FC<Props> = ({
    isCharacterPrivate,
    isCreate,
    parameterKey,
    numberParameter,
    numberMaxParameter,
    createdByMe,
    onOperate,
    compact,
}: Props) => {
    const apply =
        (operation: CharacterUpOperation) =>
        (state: CharacterState): CharacterState => {
            const result = applyCharacter({ state, operation });
            if (result.isError) {
                throw result.error;
            }
            return result.value;
        };

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
                                $r: 1,
                                numParams: {
                                    [parameterKey]: {
                                        $v: 2,
                                        $r: 1,
                                        value: { newValue: 0 },
                                    },
                                },
                            };
                            onOperate(apply(operation));
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
                            $r: 1,
                            numParams: {
                                [parameterKey]: {
                                    $v: 2,
                                    $r: 1,
                                    value: { newValue: undefined },
                                },
                            },
                        };
                        onOperate(apply(operation));
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
                                $r: 1,
                                numMaxParams: {
                                    [parameterKey]: {
                                        $v: 2,
                                        $r: 1,
                                        value: { newValue: 0 },
                                    },
                                },
                            };
                            onOperate(apply(operation));
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
                            $r: 1,
                            numMaxParams: {
                                [parameterKey]: {
                                    $v: 2,
                                    $r: 1,
                                    value: { newValue: undefined },
                                },
                            },
                        };
                        onOperate(apply(operation));
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
                        $r: 1,
                        numParams: {
                            [parameterKey]: {
                                $v: 2,
                                $r: 1,
                                isValuePrivate: { newValue: !e },
                            },
                        },
                    };
                    onOperate(apply(operation));
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
                            $r: 1,
                            numParams: {
                                [parameterKey]: {
                                    $v: 2,
                                    $r: 1,
                                    value: { newValue },
                                },
                            },
                        };
                        onOperate(apply(operation));
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
                        $r: 1,
                        numMaxParams: {
                            [parameterKey]: {
                                $v: 2,
                                $r: 1,
                                isValuePrivate: { newValue: !e },
                            },
                        },
                    };
                    onOperate(apply(operation));
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
                            $r: 1,
                            numMaxParams: {
                                [parameterKey]: {
                                    $v: 2,
                                    $r: 1,
                                    value: { newValue },
                                },
                            },
                        };
                        onOperate(apply(operation));
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
