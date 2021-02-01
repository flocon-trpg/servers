import React from 'react';
import { Button, Checkbox, InputNumber, Space, Switch } from 'antd';
import * as Character from '../stateManagers/states/character';
import * as NumParam from '../stateManagers/states/numParam';
import { update } from '../stateManagers/states/types';
import { createStateMap } from '../@shared/StateMap';
import { StrIndex100 } from '../@shared/indexes';
import { EyeInvisibleOutlined, EyeOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const inputWidth = 50;

type Props = {
    parameterKey: StrIndex100;
    numberParameter: NumParam.State | undefined;
    numberMaxParameter: NumParam.State | undefined;
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

const NumberParameterInput: React.FC<Props> = ({
    parameterKey,
    numberParameter,
    numberMaxParameter,
    createdByMe,
    onOperate,
}: Props) => {
    return (
        <div>
            {!createdByMe && numberParameter?.isValuePrivate === true ? '?' : <>
                <InputNumber
                    style={({ width: inputWidth })}
                    size='small'
                    disabled={numberParameter?.value === undefined}
                    value={numberParameter?.value ?? 0}
                    onChange={newValue => {
                        if (typeof newValue !== 'number') {
                            return;
                        }
                        const operation = createCharacterOperationBase();
                        operation.numParams.set(parameterKey, {
                            value: { newValue: newValue },
                        });
                        onOperate(operation);
                    }} />
                {numberParameter?.value === undefined ?
                    <Button
                        size='small'
                        onClick={() => {
                            const operation = createCharacterOperationBase();
                            operation.numParams.set(parameterKey, {
                                value: { newValue: 0 },
                            });
                            onOperate(operation);
                        }}>
                        <PlusOutlined />
                    </Button> :
                    <Button
                        size='small'
                        onClick={() => {
                            const operation = createCharacterOperationBase();
                            operation.numParams.set(parameterKey, {
                                value: { newValue: undefined },
                            });
                            onOperate(operation);
                        }}>
                        <DeleteOutlined />
                    </Button>}
            </>}
            <Switch
                size='small'
                disabled={!createdByMe}
                checkedChildren={<EyeOutlined />}
                unCheckedChildren={<EyeInvisibleOutlined />}
                checked={!(numberParameter?.isValuePrivate ?? false)}
                onChange={e => {
                    const operation = createCharacterOperationBase();
                    operation.numParams.set(parameterKey, {
                        isValuePrivate: { newValue: !e },
                    });
                    onOperate(operation);
                }} />
            <span>/</span>
            {!createdByMe && numberMaxParameter?.isValuePrivate === true ? '?' : <>
                <InputNumber
                    style={({ width: inputWidth })}
                    size='small'
                    disabled={numberMaxParameter?.value === undefined}
                    value={numberMaxParameter?.value ?? 0}
                    onChange={newValue => {
                        if (typeof newValue !== 'number') {
                            return;
                        }
                        const operation = createCharacterOperationBase();
                        operation.numMaxParams.set(parameterKey, {
                            value: { newValue: newValue },
                        });
                        onOperate(operation);
                    }} />
                {numberMaxParameter?.value === undefined ?
                    <Button
                        size='small'
                        onClick={() => {
                            const operation = createCharacterOperationBase();
                            operation.numMaxParams.set(parameterKey, {
                                value: { newValue: 0 },
                            });
                            onOperate(operation);
                        }}>
                        <PlusOutlined />
                    </Button> :
                    <Button
                        size='small'
                        onClick={() => {
                            const operation = createCharacterOperationBase();
                            operation.numMaxParams.set(parameterKey, {
                                value: { newValue: undefined },
                            });
                            onOperate(operation);
                        }}>
                        <DeleteOutlined />
                    </Button>}
            </>}
            <Switch
                size='small'
                disabled={!createdByMe}
                checkedChildren={<EyeOutlined />}
                unCheckedChildren={<EyeInvisibleOutlined />}
                checked={!(numberMaxParameter?.isValuePrivate ?? false)}
                onChange={e => {
                    const operation = createCharacterOperationBase();
                    operation.numMaxParams.set(parameterKey, {
                        isValuePrivate: { newValue: !e },
                    });
                    onOperate(operation);
                }} />
        </div>
    );
};

export default NumberParameterInput;