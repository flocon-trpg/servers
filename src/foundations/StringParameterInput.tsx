import React from 'react';
import { Tooltip } from 'antd';
import { update } from '../stateManagers/states/types';
import { createStateMap } from '../@shared/StateMap';
import { StrIndex100 } from '../@shared/indexes';
import { EyeInvisibleOutlined, EyeOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import ToggleButton from './ToggleButton';
import { addParameter, deleteParameter, parameterIsPrivate, parameterIsNotPrivate, parameterIsPrivateAndNotCreatedByMe, parameterIsNotPrivateAndNotCreatedByMe } from '../resource/text/main';
import { TextUpOperationModule } from '../utils/operations';
import BufferedInput from './BufferedInput';
import { StrParam } from '../stateManagers/states/strParam';
import { Character } from '../stateManagers/states/character';

const inputWidth = 150;

type Props = {
    isCharacterPrivate: boolean;
    isCreate: boolean;
    parameterKey: StrIndex100;
    parameter: StrParam.State | undefined;
    createdByMe: boolean;
    onOperate: (operation: Character.PostOperation) => void;
    compact: boolean;
}

const createCharacterOperationBase = (): Character.WritablePostOperation => ({
    pieces: createStateMap(),
    tachieLocations: createStateMap(),
    boolParams: new Map(),
    numParams: new Map(),
    numMaxParams: new Map(),
    strParams: new Map(),
});

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
                const operation = createCharacterOperationBase();
                operation.strParams.set(parameterKey, {
                    value: TextUpOperationModule.diff({ first: e.previousValue, second: e.currentValue }),
                });
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
                const operation = createCharacterOperationBase();
                operation.strParams.set(parameterKey, {
                    isValuePrivate: { newValue: !e },
                });
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