import React from 'react';
import { Button, Checkbox, InputNumber, Space, Switch, Tag, Tooltip } from 'antd';
import * as Character from '../stateManagers/states/character';
import * as NumParam from '../stateManagers/states/numParam';
import { update } from '../stateManagers/states/types';
import { createStateMap } from '../@shared/StateMap';
import { StrIndex100 } from '../@shared/indexes';
import { EyeInvisibleOutlined, EyeOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import ToggleButton from './ToggleButton';
import { addParameter, characterNotCreatedByMe, deleteParameter, makeParameterNotPrivate, makeParameterPrivate } from '../resource/text/main';

const inputWidth = 50;

type Props = {
    isCharacterPrivate: boolean;
    parameterKey: StrIndex100;
    numberParameter: NumParam.State | undefined;
    numberMaxParameter: NumParam.State | undefined;
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

const NumberParameterInput: React.FC<Props> = ({
    isCharacterPrivate,
    parameterKey,
    numberParameter,
    numberMaxParameter,
    createdByMe,
    onOperate,
    compact,
}: Props) => {
    const addOrDeleteNumberParameterButton: JSX.Element | null = (() => {
        if (compact) {
            return null;
        }
        if (numberParameter?.value === undefined) {
            return (
                <Tooltip title={addParameter}>
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
                    </Button>
                </Tooltip>);
        }
        return (
            <Tooltip title={deleteParameter}>
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
                </Button>
            </Tooltip>);
    })();

    const addOrDeleteNumberMaxParameterButton: JSX.Element | null = (() => {
        if (compact) {
            return null;
        }
        if (numberMaxParameter?.value === undefined) {
            return (
                <Tooltip title={addParameter}>
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
                    </Button>
                </Tooltip>);
        }
        return (
            <Tooltip title={deleteParameter}>
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
                </Button>
            </Tooltip>);
    })();

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
                {addOrDeleteNumberParameterButton}
            </>}
            <ToggleButton
                checked={!(numberParameter?.isValuePrivate ?? false)}
                disabled={createdByMe ? false : characterNotCreatedByMe}
                tooltip={(numberParameter?.isValuePrivate ?? false) ? makeParameterNotPrivate(isCharacterPrivate) : makeParameterPrivate(isCharacterPrivate)}
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
            <span> / </span>
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
                {addOrDeleteNumberMaxParameterButton}
            </>}
            <ToggleButton
                checked={!(numberMaxParameter?.isValuePrivate ?? false)}
                disabled={createdByMe ? false : characterNotCreatedByMe}
                tooltip={(numberMaxParameter?.isValuePrivate ?? false) ? makeParameterNotPrivate(isCharacterPrivate) : makeParameterPrivate(isCharacterPrivate)}
                checkedChildren={<EyeOutlined />}
                unCheckedChildren={<EyeInvisibleOutlined />}
                size='small'
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