import React from 'react';
import { Tooltip } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { ToggleButton } from '../../../ui/ToggleButton';
import {
    parameterIsNotPrivate,
    parameterIsNotPrivateAndNotCreatedByMe,
    parameterIsPrivate,
    parameterIsPrivateAndNotCreatedByMe,
} from '../../../../resources/text/main';
import { BufferedInput } from '../../../ui/BufferedInput';
import {
    State,
    StrIndex20,
    UpOperation,
    apply,
    characterTemplate,
    nullableTextDiff,
    strParamTemplate,
    toNullableTextUpOperation,
} from '@flocon-trpg/core';

const applyCharacter = apply(characterTemplate);
type CharacterState = State<typeof characterTemplate>;
type CharacterUpOperation = UpOperation<typeof characterTemplate>;
type StrParamState = State<typeof strParamTemplate>;

const inputWidth = 150;

type Props = {
    isCharacterPrivate: boolean;
    isCreate: boolean;
    parameterKey: StrIndex20;
    parameter: StrParamState | undefined;
    createdByMe: boolean;
    onOperate: (mapping: (character: CharacterState) => CharacterState) => void;
    compact: boolean;
};

export const StringParameterInput: React.FC<Props> = ({
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

    const input = ({ disabled }: { disabled: boolean }) => (
        <BufferedInput
            style={{ width: inputWidth }}
            size='small'
            bufferDuration='default'
            disabled={disabled}
            value={parameter?.value ?? ''}
            onChange={e => {
                // valueで??演算子を使用しているため、e.previousValueは使えない。そのため代わりにparameter?.valueを使用している
                const previousValue = parameter?.value;

                if (previousValue === e.currentValue) {
                    return;
                }
                const diff2 = nullableTextDiff({ prev: previousValue, next: e.currentValue });
                const operation: CharacterUpOperation = {
                    $v: 2,
                    $r: 1,
                    strParams: {
                        [parameterKey]: {
                            $v: 2,
                            $r: 1,
                            value:
                                diff2 === undefined ? undefined : toNullableTextUpOperation(diff2),
                        },
                    },
                };
                onOperate(apply(operation));
            }}
        />
    );

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
                {input({ disabled: true })}
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
                    strParams: {
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
    return (
        <div style={{ whiteSpace: 'nowrap' }}>
            {input({ disabled: false })}
            {compact && !createdByMe ? null : isPrivateButton}
        </div>
    );
};
