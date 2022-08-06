/** @jsxImportSource @emotion/react */
import { cancelRnd, flex, flexRow } from '@/styles/className';
import { mergeStyles } from '@/utils/mergeStyles';
import { css } from '@emotion/react';
import { Button, Popover, PopoverProps } from 'antd';
import classNames from 'classnames';
import React from 'react';
import { ColorResult, SketchPicker } from 'react-color';

type Props = {
    color?: string;
    onChange?: (newColor: ColorResult) => void;
    buttonStyle?: React.CSSProperties;
    buttonContent: React.ReactNode;
    disableAlpha?: boolean;
    trigger?: PopoverProps['trigger'];
};

export const ColorPickerButton: React.FC<Props> = ({
    color,
    onChange,
    buttonStyle,
    buttonContent,
    disableAlpha,
    trigger,
}) => {
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
                />
            }
        >
            <Button style={mergeStyles({ color }, buttonStyle)}>
                <div className={classNames(flex, flexRow)}>{buttonContent}</div>
            </Button>
        </Popover>
    );
};
