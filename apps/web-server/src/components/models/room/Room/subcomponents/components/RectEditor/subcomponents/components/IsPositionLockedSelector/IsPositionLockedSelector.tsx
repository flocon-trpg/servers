import { Checkbox } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { produce } from 'immer';
import React from 'react';
import { useLatest } from 'react-use';

type StateBase = {
    isPositionLocked: boolean;
};

type Props<T extends StateBase> = {
    value: T;
    onChange: (newValue: T) => void;
};

export const IsPositionLockedSelector = <T extends StateBase>({ value, onChange }: Props<T>) => {
    const valueRef = useLatest(value);
    const onChangeRef = useLatest(onChange);
    const onChangeCallback = React.useCallback(
        (e: CheckboxChangeEvent) => {
            const newValue = produce(valueRef.current, draft => {
                draft.isPositionLocked = e.target.checked;
            });
            onChangeRef.current(newValue);
        },
        [onChangeRef, valueRef],
    );

    return (
        <Checkbox checked={value.isPositionLocked} onChange={onChangeCallback}>
            位置を固定する
        </Checkbox>
    );
};
