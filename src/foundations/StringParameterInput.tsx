import React from 'react';
import { Button, Checkbox, InputNumber, Space, Switch, Tag, Tooltip } from 'antd';
import * as Character from '../stateManagers/states/character';
import * as StrParam from '../stateManagers/states/strParam';
import { update } from '../stateManagers/states/types';
import { createStateMap } from '../@shared/StateMap';
import { StrIndex100 } from '../@shared/indexes';
import { EyeInvisibleOutlined, EyeOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import ToggleButton from './ToggleButton';
import { addParameter, characterNotCreatedByMe, deleteParameter, makeParameterNotPrivate, makeParameterPrivate } from '../resource/text/main';
import BufferedInput from './BufferedInput';
import { TextUpOperationModule } from '../utils/operations';

const inputWidth = 150;

type Props = {
    isCharacterPrivate: boolean;
    parameterKey: StrIndex100;
    parameter: StrParam.State | undefined;
    createdByMe: boolean;
    onOperate: (operation: Character.PostOperation) => void;
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
    parameterKey,
    parameter,
    createdByMe,
    onOperate,
}: Props) => {
    return (
        <div>
            {!createdByMe && parameter?.isValuePrivate === true ? '?' :
                <BufferedInput
                    style={({ width: inputWidth })}
                    size='small'
                    value={parameter?.value ?? ''}
                    valueResetKey={0}
                    onChange={e => {
                        if (e.isReset) {
                            return;
                        }
                        const operation = createCharacterOperationBase();
                        operation.strParams.set(parameterKey, {
                            value: TextUpOperationModule.diff({first: e.previousValue, second: e.currentValue}),
                        });
                        onOperate(operation);
                    }} />}
            <ToggleButton
                checked={!(parameter?.isValuePrivate ?? false)}
                disabled={createdByMe ? false : characterNotCreatedByMe}
                tooltip={(parameter?.isValuePrivate ?? false) ? makeParameterNotPrivate(isCharacterPrivate) : makeParameterPrivate(isCharacterPrivate)}
                checkedChildren={<EyeOutlined />}
                unCheckedChildren={<EyeInvisibleOutlined />}
                size='small'
                onChange={e => {
                    const operation = createCharacterOperationBase();
                    operation.numParams.set(parameterKey, {
                        isValuePrivate: { newValue: !e },
                    });
                    onOperate(operation);
                }} />
        </div>
    );
};

export default StringParameterInput;