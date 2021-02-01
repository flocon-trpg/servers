import React from 'react';
import { Button, Checkbox, InputNumber, Space, Switch } from 'antd';
import * as Character from '../stateManagers/states/character';
import * as BoolParam from '../stateManagers/states/boolParam';
import { update } from '../stateManagers/states/types';
import { createStateMap } from '../@shared/StateMap';
import { StrIndex100 } from '../@shared/indexes';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';

type Props = {
    parameterKey: StrIndex100;
    booleanParameter: BoolParam.State | undefined;
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

const BooleanParameterInput: React.FC<Props> = ({
    parameterKey,
    booleanParameter,
    createdByMe,
    onOperate,
}: Props) => {
    return (
        <div>
            {!createdByMe && booleanParameter?.isValuePrivate === true ? '?' : <>
                <Checkbox
                    disabled={booleanParameter?.value === undefined}
                    checked={booleanParameter?.value ?? false}
                    onChange={newValue => {
                        const operation = createCharacterOperationBase();
                        operation.boolParams.set(parameterKey, {
                            value: { newValue: newValue.target.checked },
                        });
                        onOperate(operation);
                    }} />
                {booleanParameter?.value === undefined ?
                    <Button
                        size='small'
                        onClick={() => {
                            const operation = createCharacterOperationBase();
                            operation.boolParams.set(parameterKey, {
                                value: { newValue: false },
                            });
                            onOperate(operation);
                        }}>追加</Button> :
                    <Button
                        size='small'
                        onClick={() => {
                            const operation = createCharacterOperationBase();
                            operation.boolParams.set(parameterKey, {
                                value: { newValue: undefined },
                            });
                            onOperate(operation);
                        }}>削除</Button>}
            </>}
            <Switch
                size='small'
                disabled={!createdByMe}
                checkedChildren={<EyeOutlined />}
                unCheckedChildren={<EyeInvisibleOutlined />}
                checked={!(booleanParameter?.isValuePrivate ?? false)}
                onChange={e => {
                    const operation = createCharacterOperationBase();
                    operation.boolParams.set(parameterKey, {
                        isValuePrivate: { newValue: !e },
                    });
                    onOperate(operation);
                }} />
        </div>
    );
};

export default BooleanParameterInput;