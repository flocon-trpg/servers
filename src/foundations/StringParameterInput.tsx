import React from 'react';
import { Button, Checkbox, InputNumber, Space, Switch, Tag, Tooltip } from 'antd';
import * as Character from '../stateManagers/states/character';
import * as StrParam from '../stateManagers/states/strParam';
import { update } from '../stateManagers/states/types';
import { createStateMap } from '../@shared/StateMap';
import { StrIndex100 } from '../@shared/indexes';
import { EyeInvisibleOutlined, EyeOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import ToggleButton from './ToggleButton';
import { addParameter, deleteParameter, parameterIsPrivate, parameterIsNotPrivate, parameterIsPrivateAndNotCreatedByMe, parameterIsNotPrivateAndNotCreatedByMe } from '../resource/text/main';
import BufferedInput from './BufferedInput';
import { TextUpOperationModule } from '../utils/operations';

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
    pieceLocations: createStateMap(),
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
            disabled={disabled}
            value={parameter?.value ?? ''}
            valueResetKey={0}
            onChange={e => {
                if (e.isReset) {
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
        <>
            {input({ disabled: false })}
            {(compact && !createdByMe) ? null : isPrivateButton}
        </>);
};

export default StringParameterInput;