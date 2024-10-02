/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { ColorResult, SketchPicker, SketchPickerProps } from '@hello-pangea/color-picker';
import { Button, ButtonProps, Popover, PopoverProps } from 'antd';
import classNames from 'classnames';
import Color from 'color';
import React from 'react';
import { Styles } from '@/styles';
import {
    cancelRnd,
    flex,
    flexRow,
    itemsCenter,
    justifyCenter,
    justifyItemsCenter,
} from '@/styles/className';
import { mergeStyles } from '@/utils/mergeStyles';

type Props = {
    color?: string;
    onChange?: (newColor: ColorResult) => void;
    buttonStyle?: React.CSSProperties;
    buttonContent: React.ReactNode;
    buttonSize?: ButtonProps['size'];
    buttonType?: ButtonProps['type'];
    disableAlpha?: boolean;
    trigger?: PopoverProps['trigger'];
    presetColors?: SketchPickerProps['presetColors'];
};

export const ColorPickerButton: React.FC<Props> = ({
    color,
    onChange,
    buttonStyle,
    buttonContent,
    buttonSize,
    buttonType,
    disableAlpha,
    trigger,
    presetColors,
}) => {
    let backgroundColor: string | undefined = undefined;
    if (color != null) {
        const rgbValue = Color(color);
        if (rgbValue.isDark()) {
            backgroundColor = Color(Styles.backgroundColor).negate().toString();
        }
    }
    return (
        <Popover
            trigger={trigger}
            content={
                <SketchPicker
                    className={cancelRnd}
                    css={css`
                        color: black;
                    `}
                    disableAlpha={disableAlpha}
                    color={color}
                    onChange={e => onChange && onChange(e)}
                    presetColors={presetColors}
                />
            }
        >
            <Button
                style={mergeStyles({ color, width: 115 }, buttonStyle)}
                type={buttonType}
                size={buttonSize}
            >
                <div
                    className={classNames(
                        flex,
                        flexRow,
                        itemsCenter,
                        justifyItemsCenter,
                        justifyCenter,
                    )}
                    style={{ backgroundColor }}
                >
                    {buttonContent}
                </div>
            </Button>
        </Popover>
    );
};
