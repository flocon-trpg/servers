import React from 'react';
import { Tooltip } from 'antd';
import { StrIndex20 } from '../@shared/indexes';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import ToggleButton from './ToggleButton';
import { parameterIsPrivate, parameterIsNotPrivate, parameterIsPrivateAndNotCreatedByMe, parameterIsNotPrivateAndNotCreatedByMe } from '../resource/text/main';
import BufferedInput from './BufferedInput';
import * as TextOperation from '../@shared/ot/room/util/textOperation';
import * as Character from '../@shared/ot/room/participant/character/v1';
import * as StrParam from '../@shared/ot/room/participant/character/strParam/v1';

const inputWidth = 150;

type Props = {
    isCharacterPrivate: boolean;
    isCreate: boolean;
    parameterKey: StrIndex20;
    parameter: StrParam.State | undefined;
    createdByMe: boolean;
    onOperate: (operation: Character.UpOperation) => void;
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
                const operation: Character.UpOperation = {
                    $version: 1,
                    strParams: {
                        [parameterKey]: {
                            $version: 1,
                            value: TextOperation.toUpOperation(TextOperation.diff({ prev: e.previousValue, next: e.currentValue })),
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
                const operation: Character.UpOperation = {
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