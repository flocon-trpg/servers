import React from 'react';
import { Slider, InputNumber, Typography } from 'antd';
import { flex, flexRow, itemsCenter } from '../utils/className';
import classNames from 'classnames';

// '0-1'の場合、Props.valueの値の範囲が0～1だとみなされる。VolumeBarではProps.valueの値を100倍した値が表示される。onChangeの引数には0～1の範囲に変換されてから渡される。
// '0-100'の場合、Props.valueの値の範囲が0～100だとみなされる。VolumeBarはProps.valueの値をそのまま表示する。
type InputNumberType = '0-1' | '0-100';

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {
    value: number;
    minValue?: number;
    onChange: (newValue: number) => void;
    readonly: boolean;
    inputNumberType: InputNumberType;
};

const textStyle: React.CSSProperties = { flex: '100px', margin: '0 4px', width: 50 };

export const VolumeBar: React.FC<Props> = ({
    value,
    minValue,
    onChange,
    readonly,
    inputNumberType,
}: Props) => {
    // Math.roundがないと60.000000001のような中途半端な値が表示されることがある
    const roundedValue = Math.round(inputNumberType === '0-1' ? value * 100 : value);
    return (
        <div className={classNames(flex, flexRow, itemsCenter)}>
            <Slider
                disabled={readonly}
                style={{ flex: 1, minWidth: 50 }}
                min={minValue == null ? 0 : (inputNumberType === '0-1' ? (minValue * 100) : minValue)}
                max={inputNumberType === '0-1' ? 100 : 1}
                step={1}
                onChange={(newValue: unknown) => {
                    if (typeof newValue !== 'number') {
                        return;
                    }
                    const rounded = Math.round(newValue);
                    onChange(inputNumberType === '0-1' ? rounded / 100 : rounded);
                }}
                value={roundedValue}
            />
            {readonly ? (
                <Typography.Text style={textStyle}>{value}</Typography.Text>
            ) : (
                <InputNumber
                    size='small'
                    min={minValue ?? 0}
                    max={100}
                    step={1}
                    style={textStyle}
                    value={roundedValue}
                    onChange={newValue => {
                        if (typeof newValue !== 'number') {
                            return;
                        }
                        onChange(inputNumberType === '0-1' ? newValue / 100 : newValue);
                    }}
                />
            )}
        </div>
    );
};

export const OpacityBar = VolumeBar;