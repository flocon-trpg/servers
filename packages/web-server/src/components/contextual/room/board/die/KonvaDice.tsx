import React from 'react';
import * as ReactKonva from 'react-konva';
import { animated, useTransition } from '@react-spring/konva';
import { success, useImage } from '../../../../../hooks/image';

export const question = 'question';

const isD6Value = (source: number | null): boolean => {
    if (source == null || !Number.isInteger(source)) {
        return false;
    }
    return 1 <= source && source <= 6;
};

type KonvaD6Props = {
    value: number | null | typeof question;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    opacity?: number;
};

export const KonvaD6: React.FC<KonvaD6Props> = ({
    value,
    x,
    y,
    width,
    height,
    opacity,
}: KonvaD6Props) => {
    let src: string;
    if (value === question) {
        src = '/dice/q-6.png';
    } else {
        src = isD6Value(value) ? `/dice/${value}-6.png` : '/dice/0-6.png';
    }
    const image = useImage(src);

    const transitions = useTransition(value, {
        from: { opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
    });
    if (image.type !== success) {
        return null;
    }
    return (
        <ReactKonva.Group opacity={opacity ?? 1}>
            {transitions(style => {
                return (
                    <animated.Image
                        {...style}
                        x={x ?? 0}
                        y={y ?? 0}
                        width={width ?? 68}
                        height={height ?? 68}
                        image={image.image}
                    />
                );
            })}
        </ReactKonva.Group>
    );
};
