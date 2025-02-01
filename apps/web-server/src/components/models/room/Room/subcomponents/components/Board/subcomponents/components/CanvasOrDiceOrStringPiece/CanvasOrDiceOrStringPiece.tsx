import {
    State,
    boardTemplate,
    dicePieceStrIndexes,
    dicePieceTemplate,
    dieValueTemplate,
    shapePieceTemplate,
    stringPieceTemplate,
} from '@flocon-trpg/core';
import { keyNames, recordToArray } from '@flocon-trpg/utils';
import { useSpring } from '@react-spring/konva';
import React from 'react';
import * as ReactKonva from 'react-konva';
import { useMouse, usePrevious } from 'react-use';
import { ValueOf } from 'type-fest';
import { DicePieceValue } from '../../../../../utils/dicePieceValue';
import { PixelSize } from '../../../../../utils/positionAndSizeAndRect';
import { StringPieceValue } from '../../../../../utils/stringPieceValue';
import { KonvaD6 } from '../../../../KonvaDice/KonvaDice';
import { PieceGroup, PieceGroupProps } from '../../../../PieceGroup/PieceGroup';
import {
    AnimatedRectAsAnyProps,
    AnimatedTextAsAnyProps,
} from '@/components/ui/AnimatedKonvaAsAnyProps/AnimatedKonvaAsAnyProps';
import { success, useImageFromFilePath } from '@/hooks/imageHooks';
import { useMyUserUid } from '@/hooks/useMyUserUid';

type BoardState = State<typeof boardTemplate>;
type DieValueState = State<typeof dieValueTemplate>;
type DicePieceState = State<typeof dicePieceTemplate>;
type DeckPieceState = NonNullable<ValueOf<NonNullable<BoardState['deckPieces']>>>;
type ShapePieceState = State<typeof shapePieceTemplate>;
type StringPieceState = State<typeof stringPieceTemplate>;

export const dicePiece = 'dicePiece';
export const shapePiece = 'shapePiece';
export const stringPiece = 'stringPiece';

export type CanvasOrDiceOrStringPieceState =
    | {
          type: typeof dicePiece;
          state: DicePieceState;
      }
    | {
          type: typeof shapePiece;
          state: ShapePieceState;
          stateId: string;
      }
    | {
          type: typeof stringPiece;
          state: StringPieceState;
          createdByMe: boolean;
      };

type StringPieceContentProps = {
    state: StringPieceState;
    createdByMe: boolean;
} & PixelSize;

const StringPieceContent: React.FC<StringPieceContentProps> = props => {
    const text = StringPieceValue.toKonvaText(props.state, props.createdByMe, undefined);

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
                fill: prevText == null || text == null ? baseColor : transitionColor,
            },
            to: async next => {
                if (prevText == null || text == null) {
                    await next({
                        scaleX: 0,
                        x: props.w / 2,
                        fill: baseColor,
                    });
                }
                await next({
                    scaleX: 1,
                    x: 0,
                    fill: baseColor,
                });
            },
        }),
        [text],
    );
    const [textSpringProps] = useSpring(
        () => ({
            config: {
                duration,
            },
            from: {
                scaleX: 1,
                x: 0,
                opacity: 0,
            },
            to: async next => {
                if (prevText == null || text == null) {
                    await next({
                        scaleX: 0,
                        x: props.w / 2,
                        opacity: 0.5,
                    });
                }
                await next({
                    scaleX: 1,
                    x: 0,
                    opacity: 1,
                });
            },
        }),
        [text],
    );

    return (
        <>
            <AnimatedRectAsAnyProps
                {...rectSpringProps}
                y={0}
                width={props.w}
                height={props.h}
                strokeWidth={2}
                stroke="#606060B0"
                cornerRadius={5}
            />
            {/* TODO: fontSizeの決め方が適当。fontSizeはユーザーが自由に変更できるようにするべき */}
            <AnimatedTextAsAnyProps
                {...textSpringProps}
                text={text ?? '?'}
                y={0}
                width={props.w}
                height={props.h}
                fontSize={props.w / 2.5}
                fontFamily="Noto Sans JP Regular"
                fill={props.state.isValuePrivate ? 'gray' : 'black'}
                align="center"
                verticalAlign="middle"
            />
        </>
    );
};

type ShapePieceContentProps = {
    state: ShapePieceState;
    stateId: string;
    opacity: number;
} & PixelSize;

const ShapePieceContent: React.FC<ShapePieceContentProps> = ({ state, stateId, w, h, opacity }) => {
    const shapes = recordToArray(state.shapes ?? {}).map(shape => {
        return (
            <ReactKonva.Path
                key={keyNames('shapePiece', stateId, shape.key)}
                width={100}
                height={100}
                scaleX={w / 100}
                scaleY={h / 100}
                data={shape.value.shape.data}
                stroke={shape.value.stroke}
                strokeWidth={shape.value.strokeWidth}
                fill={shape.value.fill}
                opacity={opacity}
            />
        );
    });
    return <>{shapes}</>;
};

type DicePieceContentProps = {
    state: DicePieceState;
    opacity: number;
} & PixelSize;

const DicePieceContent: React.FC<DicePieceContentProps> = ({ state, w, h, opacity }) => {
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
        const die = state.dice?.[i];
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

    const background = <ReactKonva.Rect x={0} y={0} width={w} height={h} fill="transparent" />;

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
    state: CanvasOrDiceOrStringPieceState;
    opacity: number;
} & PixelSize;

const ValueContent: React.FC<ValueContentProps> = props => {
    switch (props.state.type) {
        case shapePiece: {
            return (
                <ShapePieceContent
                    {...props}
                    state={props.state.state}
                    stateId={props.state.stateId}
                />
            );
        }
        case dicePiece: {
            return <DicePieceContent {...props} state={props.state.state} />;
        }
        case stringPiece: {
            return (
                <StringPieceContent
                    {...props}
                    state={props.state.state}
                    createdByMe={props.state.createdByMe}
                />
            );
        }
    }
};

type Props = {
    state: CanvasOrDiceOrStringPieceState;
    opacity: number;
} & PieceGroupProps;

// DicePieceとShapePieceとStringPieceを表示するコンポーネント。これらのPieceはどれもアニメーションがなくコードが単純なため共通化している。
export const DiceOrShapeOrStringPiece: React.FC<Props> = props => {
    return (
        <PieceGroup {...props}>
            <ValueContent {...props} />
        </PieceGroup>
    );
};
