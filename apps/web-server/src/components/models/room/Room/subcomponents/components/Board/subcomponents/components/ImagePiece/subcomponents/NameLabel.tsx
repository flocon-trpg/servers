import React from 'react';
import * as ReactKonva from 'react-konva';
import Konva from 'konva';
import {
    PixelPosition,
    PixelSize,
} from '@/components/models/room/Room/subcomponents/utils/positionAndSizeAndRect';

type Props = {
    text?: string;
} & PixelPosition &
    PixelSize;

export const NameLabel: React.FC<Props> = (props: Props) => {
    const xRatio = 1;
    const yRatio = 1 / 5;
    const innerX = (1 - xRatio) * props.w;
    const innerY = (1 - yRatio) * props.h;
    const innerW = props.w * xRatio;
    const innerH = props.h * yRatio;

    if (props.text == null || props.text === '') {
        return null;
    }

    const textPropsBase: Konva.TextConfig = {
        text: props.text,
        fontSize: innerH * 0.9,
        fontFamily: 'Noto Sans JP Regular',
        align: 'center',
        verticalAlign: 'middle',
    };

    return (
        <ReactKonva.Label x={innerX} y={innerY} width={innerW} height={innerH}>
            <ReactKonva.Tag fill='#606060D0' />

            <ReactKonva.Text {...textPropsBase} width={innerW} fill='white' wrap='none' ellipsis />
        </ReactKonva.Label>
    );
};
