import React from 'react';
import * as ReactKonva from 'react-konva';
import { animated, useSpring } from '@react-spring/konva';
import {
    DicePieceState,
    dicePieceStrIndexes,
    StringPieceState,
    DieValueState,
} from '@flocon-trpg/core';
import { StringPieceValue } from '../../utils/stringPieceValue';
import { KonvaD6 } from '../KonvaDice';
import { DicePieceValue } from '../../utils/dicePieceValue';
import { usePrevious } from 'react-use';
import { Size } from '../../utils/types';
import { PieceGroup, PieceGroupProps } from './PieceGroup';

export const stringPiece = 'stringPiece';
export const dicePiece = 'dicePiece';

export type DiceOrStringPieceState =
    | {
          type: typeof stringPiece;
          state: StringPieceState;
      }
    | {
          type: typeof dicePiece;
          state: DicePieceState;
      };

type StringPieceContentProps = {
    createdByMe: boolean;
    state: StringPieceState;
} & Size;

const StringPieceContent: React.FC<StringPieceContentProps> = (
    props: StringPieceContentProps
) => {
    const text = StringPieceValue.toKonvaText(props.state, props.createdByMe);

    const prevText = usePrevious(text);

    const duration = 300;

    const baseColor = '#F0F0F0FF';
    const transitionColor = '#A0F0F0FF';
    const [rectSpringProps] = useSpring(
        () => ({
            config: {
                duration,
            },
            from: {
                scaleX: 1,
                x: 0,
                fill: prevText === '?' || text === '?' ? baseColor : transitionColor,
            },
            to: async (next, cancel) => {
                if (prevText === '?' || text === '?') {
                    await next({
                        scaleX: 0,
                        x: props.w / 2,
                        fill: baseColor,
                    });
                } else {
                    await next({});
                }
                await next({
                    scaleX: 1,
                    x: 0,
                    fill: baseColor,
                });
            },
        }),
        [text]
    );
    const [textSpringProps] = useSpring(
        () => ({
            config: {
                duration,
            },
            from: {
                text: prevText === '?' || text === '?' ? prevText : text,
                scaleX: 1,
                x: 0,
            },
            to: async (next, cancel) => {
                if (prevText === '?' || text === '?') {
                    await next({
                        scaleX: 0,
                        x: props.w / 2,
                    });
                } else {
                    await next({});
                }
                await next({
                    text,
                    scaleX: 1,
                    x: 0,
                });
            },
        }),
        [text]
    );

    return (
        <>
            <animated.Rect
                {...rectSpringProps}
                y={0}
                width={props.w}
                height={props.h}
                strokeWidth={2}
                stroke='#606060B0'
                cornerRadius={5}
            />
            {/* fontSizeの決め方は適当 */}
            <animated.Text
                {...textSpringProps}
                y={0}
                width={props.w}
                height={props.h}
                fontSize={props.w / 2.5}
                fontFamily='Noto Sans JP Regular'
                fill='black'
                align='center'
                verticalAlign='middle'
            />
        </>
    );
};

type DicePieceContentProps = {
    createdByMe: boolean;
    state: DicePieceState;
    opacity: number;
} & Size;

const DicePieceContent: React.FC<DicePieceContentProps> = ({
    createdByMe,
    state,
    w,
    h,
    opacity,
}: DicePieceContentProps) => {
    const largeDieWidth = (w * 2) / 3;
    const largeDieHeight = (h * 2) / 3;
    const dieWidth = w / 2 - w / 20;
    const dieHeight = h / 2 - h / 20;
    const positions = {
        [1]: [
            {
                x: w / 2 - largeDieWidth / 2,
                y: h / 2 - largeDieHeight / 2,
                w: largeDieWidth,
                h: largeDieHeight,
            },
        ] as const,
        [2]: [
            {
                x: w / 20,
                y: h / 2 - dieHeight / 2,
                w: dieWidth,
                h: dieHeight,
            },
            {
                x: w / 20 + dieWidth,
                y: h / 2 - dieHeight / 2,
                w: dieWidth,
                h: dieHeight,
            },
        ] as const,
        [3]: [
            {
                x: w / 20,
                y: h / 20,
                w: dieWidth,
                h: dieHeight,
            },
            {
                x: w / 20 + dieWidth,
                y: h / 20,
                w: dieWidth,
                h: dieHeight,
            },
            {
                x: w / 20 + dieWidth / 2,
                y: h / 20 + dieHeight,
                w: dieWidth,
                h: dieHeight,
            },
        ] as const,
        [4]: [
            {
                x: w / 20,
                y: h / 20,
                w: dieWidth,
                h: dieHeight,
            },
            {
                x: w / 20 + dieWidth,
                y: h / 20,
                w: dieWidth,
                h: dieHeight,
            },
            {
                x: w / 20,
                y: h / 20 + dieHeight,
                w: dieWidth,
                h: dieHeight,
            },
            {
                x: w / 20 + dieWidth,
                y: h / 20 + dieHeight,
                w: dieWidth,
                h: dieHeight,
            },
        ] as const,
    };

    const dice: DieValueState[] = [];
    dicePieceStrIndexes.forEach(i => {
        const die = state.dice[i];
        if (die != null) {
            dice.push(die);
        }
    });

    let count: 0 | 1 | 2 | 3 | 4;
    switch (dice.length) {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
            count = dice.length;
            break;
        default:
            return null;
    }

    const background = <ReactKonva.Rect x={0} y={0} width={w} height={h} fill='transparent' />;

    if (count === 0) {
        return (
            <ReactKonva.Group width={w} height={h}>
                {background}
                {/* ダイスがないと透明、ということにすると行方不明になってしまうので、暫定的に空ダイスを1つ表示させている */}
                <KonvaD6
                    x={positions[1][0].x}
                    y={positions[1][0].y}
                    width={positions[1][0].w}
                    height={positions[1][0].h}
                    value={null}
                />
            </ReactKonva.Group>
        );
    }

    const diceOpacity = (isValuePrivate: boolean) =>
        (isValuePrivate ? DicePieceValue.privateValueOpacity : 1) * opacity;

    return (
        <ReactKonva.Group width={w} height={h}>
            {background}
            {dice[0] != null && (
                <KonvaD6
                    x={positions[count][0].x}
                    y={positions[count][0].y}
                    width={positions[count][0].w}
                    height={positions[count][0].h}
                    value={dice[0].value ?? null}
                    opacity={diceOpacity(dice[0].isValuePrivate)}
                />
            )}
            {dice[1] != null && count !== 1 && (
                <KonvaD6
                    x={positions[count][1].x}
                    y={positions[count][1].y}
                    width={positions[count][1].w}
                    height={positions[count][1].h}
                    value={dice[1].value ?? null}
                    opacity={diceOpacity(dice[1].isValuePrivate)}
                />
            )}
            {dice[2] != null && (count === 3 || count === 4) && (
                <KonvaD6
                    x={positions[count][2].x}
                    y={positions[count][2].y}
                    width={positions[count][2].w}
                    height={positions[count][2].h}
                    value={dice[2].value ?? null}
                    opacity={diceOpacity(dice[2].isValuePrivate)}
                />
            )}
            {dice[3] != null && count === 4 && (
                <KonvaD6
                    x={positions[count][3].x}
                    y={positions[count][3].y}
                    width={positions[count][3].w}
                    height={positions[count][3].h}
                    value={dice[3].value ?? null}
                    opacity={diceOpacity(dice[3].isValuePrivate)}
                />
            )}
        </ReactKonva.Group>
    );
};

type ValueContentProps = {
    createdByMe: boolean;
    state: DiceOrStringPieceState;
    opacity: number;
} & Size;

const ValueContent: React.FC<ValueContentProps> = (props: ValueContentProps) => {
    switch (props.state.type) {
        case dicePiece: {
            return <DicePieceContent {...props} state={props.state.state} />;
        }
        case stringPiece: {
            return <StringPieceContent {...props} state={props.state.state} />;
        }
    }
};

type Props = {
    state: DiceOrStringPieceState;
    createdByMe: boolean;
    opacity: number;
} & PieceGroupProps;

// ImagePieceはCharacterなどと表示方法が近いので、ここでは実装していない
export const DiceOrNumberPiece: React.FC<Props> = (props: Props) => {
    return (
        <PieceGroup {...props}>
            <ValueContent {...props} />
        </PieceGroup>
    );
};
