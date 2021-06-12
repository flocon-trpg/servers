import React from 'react';
import { InputNumber } from 'antd';
import { State } from '@kizahasi/flocon-core/dist/internal/ot/room/character/dicePieceValue/dieValue/v1';

type Props = {
    state: State;
    onChange: (newValue: number | null) => void;
    disabled?: boolean;
};

export const InputDie: React.FC<Props> = ({
    state,
    onChange,
    disabled,
}: Props) => {
    let max: number;
    switch (state.dieType) {
        case 'D4':
            max = 4;
            break;
        case 'D6':
            max = 6;
            break;
    }
    return (
        <InputNumber disabled={disabled} min={0} max={max} value={state.value ?? 0} onChange={e => {
            if (e === 0) {
                onChange(null);
                return;
            }
            onChange(e);
        }} />
    );
};