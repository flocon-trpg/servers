import React from 'react';
import { Button, Checkbox, Input, InputNumber, Space, Switch, Tag, Tooltip } from 'antd';
import * as Character from '../stateManagers/states/character';
import * as NumParam from '../stateManagers/states/numParam';
import { update } from '../stateManagers/states/types';
import { createStateMap } from '../@shared/StateMap';
import { StrIndex100 } from '../@shared/indexes';
import { EyeInvisibleOutlined, EyeOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import ToggleButton from './ToggleButton';
import { addParameter, deleteParameter, parameterIsPrivate, parameterIsNotPrivate, parameterIsPrivateAndNotCreatedByMe, parameterIsNotPrivateAndNotCreatedByMe } from '../resource/text/main';

const inputWidth = 50;

type Props = {
    isCharacterPrivate: boolean;
    isCreate: boolean;
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

const disabledInput = (<Input style={({ width: inputWidth })} disabled value='?' size='small' />);

const NumberParameterInput: React.FC<Props> = ({
    isCharacterPrivate,
    isCreate,
    parameterKey,
    numberParameter,
    numberMaxParameter,
    createdByMe,
    onOperate,
    compact,
}: Props) => {
    const addOrDeleteNumberParameterButton = ({ disabled }: { disabled: boolean }): JSX.Element | null => {
        if (compact) {
            return null;
        }
        if (numberParameter?.value == null) {
            return (
                <Tooltip title={addParameter}>
                    <Button
                        size='small'
                        disabled={disabled}
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
                    disabled={disabled}
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
    };

    const addOrDeleteNumberMaxParameterButton = ({ disabled }: { disabled: boolean }): JSX.Element | null => {
        if (compact) {
            return null;
        }
        if (numberMaxParameter?.value == null) {
            return (
                <Tooltip title={addParameter}>
                    <Button
                        size='small'
                        disabled={disabled}
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
                    disabled={disabled}
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
    };

    const numberParameterInput = (() => {
        if (!createdByMe && numberParameter?.isValuePrivate === true) {
            if (compact) {
                return (<Tooltip title={parameterIsPrivateAndNotCreatedByMe}><EyeInvisibleOutlined /></Tooltip>);
            }
            return (
                <>
                    {disabledInput}
                    {addOrDeleteNumberParameterButton({ disabled: true })}
                    <Tooltip title={parameterIsPrivateAndNotCreatedByMe}><EyeInvisibleOutlined /></Tooltip>
                </>
            );
        }
        const isPrivateButton = (
            <ToggleButton
                checked={!(numberParameter?.isValuePrivate ?? false)}
                disabled={createdByMe ? false : parameterIsNotPrivateAndNotCreatedByMe}
                hideWhenDisabled={compact}
                showAsTextWhenDisabled={!compact}
                tooltip={(numberParameter?.isValuePrivate ?? false) ? parameterIsPrivate({ isCharacterPrivate, isCreate }) : parameterIsNotPrivate({ isCharacterPrivate, isCreate })}
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
        );
        if (numberParameter?.value == null) {
            if (compact) {
                return null;
            }
            return (<>
                {disabledInput}
                {addOrDeleteNumberParameterButton({ disabled: false })}
                {isPrivateButton}
            </>);
        }
        return (
            <>
                <InputNumber
                    style={({ width: inputWidth })}
                    size='small'
                    disabled={numberParameter?.value == null}
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
                {addOrDeleteNumberParameterButton({ disabled: false })}
                {isPrivateButton}
            </>);
    })();
    const numberMaxParameterInput = (() => {
        if (!createdByMe && numberMaxParameter?.isValuePrivate === true) {
            if (compact) {
                return (<Tooltip title={parameterIsPrivateAndNotCreatedByMe}><EyeInvisibleOutlined /></Tooltip>);
            }
            return (
                <>
                    {disabledInput}
                    {addOrDeleteNumberMaxParameterButton({ disabled: true })}
                    <Tooltip title={parameterIsPrivateAndNotCreatedByMe}><EyeInvisibleOutlined /></Tooltip>
                </>
            );
        }
        const isPrivateButton = (
            <ToggleButton
                checked={!(numberMaxParameter?.isValuePrivate ?? false)}
                disabled={createdByMe ? false : parameterIsNotPrivateAndNotCreatedByMe}
                hideWhenDisabled={compact}
                showAsTextWhenDisabled={!compact}
                tooltip={(numberMaxParameter?.isValuePrivate ?? false) ? parameterIsPrivate({ isCharacterPrivate, isCreate }) : parameterIsNotPrivate({ isCharacterPrivate, isCreate })}
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
        );
        if (numberMaxParameter?.value == null) {
            if (compact) {
                return null;
            }
            return (<>
                {disabledInput}
                {addOrDeleteNumberMaxParameterButton({ disabled: false })}
                {isPrivateButton}
            </>);
        }
        return (
            <>
                <InputNumber
                    style={({ width: inputWidth })}
                    size='small'
                    disabled={numberMaxParameter.value == null}
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
                {addOrDeleteNumberMaxParameterButton({ disabled: false })}
                {isPrivateButton}
            </>
        );
    })();

    return (
        <div style={({ whiteSpace: 'nowrap' })}>
            {numberParameterInput}
            {(numberParameterInput == null && numberMaxParameterInput != null) ? disabledInput : null}
            {numberMaxParameterInput == null ? null : (<span> / </span>)}
            {numberMaxParameterInput}
        </div>
    );
};

export default NumberParameterInput;