import { DeleteOutlined, EyeInvisibleOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import {
    State,
    StrIndex20,
    UpOperation,
    apply,
    boolParamTemplate,
    characterTemplate,
} from '@flocon-trpg/core';
import { Button, Checkbox, Tooltip } from 'antd';
import React from 'react';
import { ToggleButton } from '@/components/ui/ToggleButton/ToggleButton';
import {
    addParameter,
    deleteParameter,
    parameterIsNotPrivate,
    parameterIsNotPrivateAndNotCreatedByMe,
    parameterIsPrivate,
    parameterIsPrivateAndNotCreatedByMe,
} from '@/resources/text/main';

type BoolParamState = State<typeof boolParamTemplate>;
type CharacterState = State<typeof characterTemplate>;
type CharacterUpOperation = UpOperation<typeof characterTemplate>;
const applyCharacter = apply(characterTemplate);

type Props = {
    isCharacterPrivate: boolean;
    isCreate: boolean;
    parameterKey: StrIndex20;
    parameter: BoolParamState | undefined;
    createdByMe: boolean;
    onOperate: (mapping: (character: CharacterState) => CharacterState) => void;
    compact: boolean;
};

export const BooleanParameterInput: React.FC<Props> = ({
    isCharacterPrivate,
    isCreate,
    parameterKey,
    parameter,
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

    const checkbox = ({ disabled }: { disabled: boolean }) => (
        <Checkbox
            disabled={disabled}
            checked={parameter?.value ?? false}
            onChange={e => {
                const operation: CharacterUpOperation = {
                    $v: 2,
                    $r: 1,
                    boolParams: {
                        [parameterKey]: {
                            $v: 2,
                            $r: 1,
                            value: { newValue: e.target.checked },
                        },
                    },
                };
                onOperate(apply(operation));
            }}
        />
    );

    const addOrDeleteButton = ({ disabled }: { disabled: boolean }): JSX.Element | null => {
        if (compact) {
            return null;
        }
        if (parameter?.value == null) {
            return (
                <Tooltip title={addParameter}>
                    <Button
                        size='small'
                        disabled={disabled}
                        onClick={() => {
                            const operation: CharacterUpOperation = {
                                $v: 2,
                                $r: 1,
                                boolParams: {
                                    [parameterKey]: {
                                        $v: 2,
                                        $r: 1,
                                        value: { newValue: false },
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
                            boolParams: {
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

    if (!createdByMe && parameter?.isValuePrivate === true) {
        if (compact) {
            return (
                <Tooltip title={parameterIsPrivateAndNotCreatedByMe}>
                    <EyeInvisibleOutlined />
                </Tooltip>
            );
        }
        return (
            <>
                {checkbox({ disabled: true })}
                {addOrDeleteButton({ disabled: true })}
                <Tooltip title={parameterIsPrivateAndNotCreatedByMe}>
                    <EyeInvisibleOutlined />
                </Tooltip>
            </>
        );
    }
    const isPrivateButton = (
        <ToggleButton
            checked={!(parameter?.isValuePrivate ?? false)}
            disabled={createdByMe ? false : parameterIsNotPrivateAndNotCreatedByMe}
            hideWhenDisabled={compact}
            showAsTextWhenDisabled={!compact}
            tooltip={
                parameter?.isValuePrivate ?? false
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
                    boolParams: {
                        [parameterKey]: {
                            $v: 2,
                            $r: 1,
                            isValuePrivate: { newValue: !e },
                        },
                    },
                };
                onOperate(apply(operation));
            }}
            shape='circle'
            defaultType='dashed'
        />
    );
    if (parameter?.value == null) {
        if (compact) {
            return null;
        }
        return (
            <>
                {checkbox({ disabled: true })}
                {addOrDeleteButton({ disabled: false })}
                {isPrivateButton}
            </>
        );
    }
    return (
        <div style={{ whiteSpace: 'nowrap' }}>
            {checkbox({ disabled: false })}
            {addOrDeleteButton({ disabled: false })}
            {isPrivateButton}
        </div>
    );
};
