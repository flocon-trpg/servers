import React from 'react';
import { Tooltip } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { ToggleButton } from '@/components/ui/ToggleButton/ToggleButton';
import {
    parameterIsNotPrivate,
    parameterIsNotPrivateAndNotCreatedByMe,
    parameterIsPrivate,
    parameterIsPrivateAndNotCreatedByMe,
} from '@/resources/text/main';
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
import { CollaborativeInput } from '@/components/ui/CollaborativeInput/CollaborativeInput';
import classNames from 'classnames';
import { flex, flex1, flexNone } from '@/styles/className';

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
        <CollaborativeInput
            style={{ width: inputWidth }}
            className={classNames(flex1)}
            size='small'
            bufferDuration='default'
            disabled={disabled}
            value={parameter?.value ?? ''}
            onChange={e => {
                // value????????????????????????????????????????????e.previousValue??????????????????????????????????????????parameter?.value?????????????????????
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
                    <EyeInvisibleOutlined className={classNames(flexNone)} />
                </Tooltip>
            );
        }
        return (
            <>
                {input({ disabled: true })}
                <Tooltip title={parameterIsPrivateAndNotCreatedByMe}>
                    <EyeInvisibleOutlined className={classNames(flexNone)} />
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
        <div className={classNames(flex)} style={{ whiteSpace: 'nowrap' }}>
            {input({ disabled: false })}
            {compact && !createdByMe ? null : isPrivateButton}
        </div>
    );
};
