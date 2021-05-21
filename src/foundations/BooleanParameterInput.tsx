import React from 'react';
import { Button, Checkbox, Tooltip } from 'antd';
import { StrIndex20 } from '../@shared/indexes';
import { EyeInvisibleOutlined, EyeOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import ToggleButton from './ToggleButton';
import { addParameter, deleteParameter, parameterIsNotPrivate, parameterIsNotPrivateAndNotCreatedByMe, parameterIsPrivate, parameterIsPrivateAndNotCreatedByMe } from '../resource/text/main';
import * as Character from '../@shared/ot/room/participant/character/v1';
import * as BoolParam from '../@shared/ot/room/participant/character/boolParam/v1';

type Props = {
    isCharacterPrivate: boolean;
    isCreate: boolean;
    parameterKey: StrIndex20;
    parameter: BoolParam.State | undefined;
    createdByMe: boolean;
    onOperate: (operation: Character.UpOperation) => void;
    compact: boolean;
}

const BooleanParameterInput: React.FC<Props> = ({
    isCharacterPrivate,
    isCreate,
    parameterKey,
    parameter,
    createdByMe,
    onOperate,
    compact,
}: Props) => {
    const checkbox = ({ disabled }: { disabled: boolean }) => (
        <Checkbox
            disabled={disabled}
            checked={parameter?.value ?? false}
            onChange={e => {
                const operation: Character.UpOperation = {
                    $version: 1,
                    boolParams: {
                        [parameterKey]: {
                            $version: 1,
                            value: { newValue: e.target.checked },
                        }
                    }
                };
                onOperate(operation);
            }} />
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
                            const operation: Character.UpOperation = {
                                $version: 1,
                                boolParams: {
                                    [parameterKey]: {
                                        $version: 1,
                                        value: { newValue: false },
                                    }
                                }
                            };
                            onOperate(operation);
                        }}>
                        <PlusOutlined />
                    </Button>
                </Tooltip>);
        }
        return (
            <Tooltip title={deleteParameter}>
                <Button
                    size='small'
                    disabled={disabled}
                    onClick={() => {
                        const operation: Character.UpOperation = {
                            $version: 1,
                            boolParams: {
                                [parameterKey]: {
                                    $version: 1,
                                    value: { newValue: undefined },
                                }
                            }
                        };
                        onOperate(operation);
                    }}>
                    <DeleteOutlined />
                </Button>
            </Tooltip>);
    };

    if (!createdByMe && parameter?.isValuePrivate === true) {
        if (compact) {
            return (<Tooltip title={parameterIsPrivateAndNotCreatedByMe}><EyeInvisibleOutlined /></Tooltip>);
        }
        return (
            <>
                {checkbox({ disabled: true })}
                {addOrDeleteButton({ disabled: true })}
                <Tooltip title={parameterIsPrivateAndNotCreatedByMe}><EyeInvisibleOutlined /></Tooltip>
            </>
        );
    }
    const isPrivateButton = (
        <ToggleButton
            checked={!(parameter?.isValuePrivate ?? false)}
            disabled={createdByMe ? false : parameterIsNotPrivateAndNotCreatedByMe}
            hideWhenDisabled={compact}
            showAsTextWhenDisabled={!compact}
            tooltip={(parameter?.isValuePrivate ?? false) ? parameterIsPrivate({ isCharacterPrivate, isCreate }) : parameterIsNotPrivate({ isCharacterPrivate, isCreate })}
            checkedChildren={<EyeOutlined />}
            unCheckedChildren={<EyeInvisibleOutlined />}
            size='small'
            onChange={e => {
                const operation: Character.UpOperation = {
                    $version: 1,
                    boolParams: {
                        [parameterKey]: {
                            $version: 1,
                            isValuePrivate: { newValue: !e },
                        }
                    }
                };
                onOperate(operation);
            }} />
    );
    if (parameter?.value == null) {
        if (compact) {
            return null;
        }
        return (<>
            {checkbox({ disabled: true })}
            {addOrDeleteButton({ disabled: false })}
            {isPrivateButton}
        </>);
    }
    return (
        <div style={({ whiteSpace: 'nowrap' })}>
            {checkbox({ disabled: false })}
            {addOrDeleteButton({ disabled: false })}
            {isPrivateButton}
        </div>);
};

export default BooleanParameterInput;