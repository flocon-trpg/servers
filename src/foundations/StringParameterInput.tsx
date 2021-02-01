import React from 'react';
import { Button, Checkbox, Input, InputNumber, Space, Switch } from 'antd';
import * as Character from '../stateManagers/states/character';
import * as StrParam from '../stateManagers/states/strParam';
import { update } from '../stateManagers/states/types';
import { createStateMap } from '../@shared/StateMap';
import { StrIndex100 } from '../@shared/indexes';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { TextUpOperationModule } from '../utils/operations';

const inputWidth = 120;

type Props = {
    parameterKey: StrIndex100;
    stringParameter: StrParam.State | undefined;
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
    parameterKey,
    stringParameter,
    createdByMe,
    onOperate,
}: Props) => {
    return (
        <div>
            {!createdByMe && stringParameter?.isValuePrivate === true ? '?' : <>
                <Input
                    size='small'
                    style={({ width: inputWidth })}
                    value={stringParameter?.value ?? ''}
                    onChange={e => {
                        const operation = createCharacterOperationBase();
                        operation.strParams.set(parameterKey, {
                            value: TextUpOperationModule.diff({ first: stringParameter?.value ?? '', second: e.target.value}),
                        });
                        onOperate(operation);
                    }} />
            </>}
            <Switch
                size='small'
                disabled={!createdByMe}
                checkedChildren={<EyeOutlined />}
                unCheckedChildren={<EyeInvisibleOutlined />}
                checked={!(stringParameter?.isValuePrivate ?? false)}
                onChange={e => {
                    const operation = createCharacterOperationBase();
                    operation.strParams.set(parameterKey, {
                        isValuePrivate: { newValue: !e },
                    });
                    onOperate(operation);
                }} />
        </div>
    );
};

export default StringParameterInput;