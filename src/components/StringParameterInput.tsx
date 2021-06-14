import React from 'react';
import { Tooltip } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import ToggleButton from './ToggleButton';
import { parameterIsPrivate, parameterIsNotPrivate, parameterIsPrivateAndNotCreatedByMe, parameterIsNotPrivateAndNotCreatedByMe } from '../resource/text/main';
import BufferedInput from './BufferedInput';
import { StrIndex20 } from '@kizahasi/util';
import { CharacterUpOperation, StrParamState, textDiff, toTextUpOperation } from '@kizahasi/flocon-core';

const inputWidth = 150;

type Props = {
    isCharacterPrivate: boolean;
    isCreate: boolean;
    parameterKey: StrIndex20;
    parameter: StrParamState | undefined;
    createdByMe: boolean;
    onOperate: (operation: CharacterUpOperation) => void;
    compact: boolean;
}

const StringParameterInput: React.FC<Props> = ({
    isCharacterPrivate,
    isCreate,
    parameterKey,
    parameter,
    createdByMe,
    onOperate,
    compact,
}: Props) => {
    const input = ({ disabled }: { disabled: boolean }) => (
        <BufferedInput
            style={({ width: inputWidth })}
            size='small'
            bufferDuration='default'
            disabled={disabled}
            value={parameter?.value ?? ''}
            onChange={e => {
                if (e.previousValue === e.currentValue) {
                    return;
                }
                const diff2 = textDiff({ prev: e.previousValue, next: e.currentValue });
                const operation: CharacterUpOperation = {
                    $version: 1,
                    strParams: {
                        [parameterKey]: {
                            $version: 1,
                            value: diff2 === undefined ? undefined : toTextUpOperation(diff2),
                        }
                    }
                };
                onOperate(operation);
            }} />
    );

    if (!createdByMe && parameter?.isValuePrivate === true) {
        if (compact) {
            return (<Tooltip title={parameterIsPrivateAndNotCreatedByMe}><EyeInvisibleOutlined /></Tooltip>);
        }
        return (
            <>
                {input({ disabled: true })}
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
                const operation: CharacterUpOperation = {
                    $version: 1,
                    strParams: {
                        [parameterKey]: {
                            $version: 1,
                            isValuePrivate: { newValue: !e },
                        }
                    }
                };
                onOperate(operation);
            }} />
    );
    return (
        <div style={({ whiteSpace: 'nowrap' })}>
            {input({ disabled: false })}
            {(compact && !createdByMe) ? null : isPrivateButton}
        </div>);
};

export default StringParameterInput;