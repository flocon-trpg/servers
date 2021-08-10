import Konva from 'konva';
import { KonvaEventObject } from 'konva/types/Node';
import React from 'react';
import * as ReactKonva from 'react-konva';
import { animated, useSpring } from '@react-spring/konva';
import {
    DicePieceValueState,
    dicePieceValueStrIndexes,
    NumberPieceValueState,
} from '@kizahasi/flocon-core';
import { NumberPieceValue } from '../../utils/numberPieceValue';
import { KonvaD6 } from '../KonvaDice';
import { State as DieValueState } from '@kizahasi/flocon-core/dist/types/internal/ot/room/character/dicePieceValue/dieValue/v1';
import { DicePieceValue } from '../../utils/dicePieceValue';
import { usePrevious } from 'react-use';
import { DragEndResult, Size, Vector2 } from '../../utils/types';
import { imageMinimalSize } from './resources';

export const numberPiece = 'numberPiece';
export const dicePiece = 'dicePiece';

export type DiceOrNumberPieceState =
    | {
          type: typeof numberPiece;
          state: NumberPieceValueState;
      }
    | {
          type: typeof dicePiece;
          state: DicePieceValueState;
      };

type NumberPieceValueContentProps = {
    createdByMe: boolean;
    state: NumberPieceValueState;
} & Size;

const NumberPieceValueContent: React.FC<NumberPieceValueContentProps> = (
    props: NumberPieceValueContentProps
) => {
    const text = NumberPieceValue.toKonvaText(props.state, props.createdByMe);

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
                stroke="#606060B0"
                cornerRadius={5}
            />
            {/* fontSizeの決め方は適当 */}
            <animated.Text
                {...textSpringProps}
                y={0}
                width={props.w}
                height={props.h}
                fontSize={props.w / 2.5}
                fontFamily="Noto Sans JP Regular"
                fill="black"
                align="center"
                verticalAlign="middle"
            />
        </>
    );
};

type DicePieceValueContentProps = {
    createdByMe: boolean;
    state: DicePieceValueState;
} & Size;

const DicePieceValueContent: React.FC<DicePieceValueContentProps> = ({
    createdByMe,
    state,
    w,
    h,
}: DicePieceValueContentProps) => {
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
    dicePieceValueStrIndexes.forEach(i => {
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
        isValuePrivate ? DicePieceValue.privateValueOpacity : 1;

    return (
        <ReactKonva.Group width={w} height={h}>
            {background}
            {dice[0] != null && (
                <KonvaD6
                    x={positions[count][0].x}
                    y={positions[count][0].y}
                    width={positions[count][0].w}
                    height={positions[count][0].h}
                    value={dice[0].value}
                    opacity={diceOpacity(dice[0].isValuePrivate)}
                />
            )}
            {dice[1] != null && count !== 1 && (
                <KonvaD6
                    x={positions[count][1].x}
                    y={positions[count][1].y}
                    width={positions[count][1].w}
                    height={positions[count][1].h}
                    value={dice[1].value}
                    opacity={diceOpacity(dice[1].isValuePrivate)}
                />
            )}
            {dice[2] != null && (count === 3 || count === 4) && (
                <KonvaD6
                    x={positions[count][2].x}
                    y={positions[count][2].y}
                    width={positions[count][2].w}
                    height={positions[count][2].h}
                    value={dice[2].value}
                    opacity={diceOpacity(dice[2].isValuePrivate)}
                />
            )}
            {dice[3] != null && count === 4 && (
                <KonvaD6
                    x={positions[count][3].x}
                    y={positions[count][3].y}
                    width={positions[count][3].w}
                    height={positions[count][3].h}
                    value={dice[3].value}
                    opacity={diceOpacity(dice[3].isValuePrivate)}
                />
            )}
        </ReactKonva.Group>
    );
};

type ValueContentProps = {
    createdByMe: boolean;
    state: DiceOrNumberPieceState;
} & Size;

const ValueContent: React.FC<ValueContentProps> = (props: ValueContentProps) => {
    switch (props.state.type) {
        case dicePiece: {
            return <DicePieceValueContent {...props} state={props.state.state} />;
        }
        case numberPiece: {
            return <NumberPieceValueContent {...props} state={props.state.state} />;
        }
    }
};

type Props = {
    state: DiceOrNumberPieceState;
    createdByMe: boolean;
    isSelected: boolean;
    draggable: boolean;
    listening: boolean;

    onDragEnd?: (resize: DragEndResult) => void;
    onClick?: () => void;
    onDblClick?: (e: KonvaEventObject<MouseEvent>) => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
} & Vector2 &
    Size;

// ImagePieceはCharacterなどと表示方法が近いので、ここでは実装していない
export const DiceOrNumberPiece: React.FC<Props> = (props: Props) => {
    /*
        リサイズや移動の実装方法についてはこちらを参照
        https://konvajs.org/docs/react/Transformer.html
        */

    const groupRef = React.useRef<Konva.Group | null>(null);
    const transformerRef = React.useRef<Konva.Transformer | null>(null);

    React.useEffect(() => {
        if (!props.isSelected) {
            return;
        }
        if (transformerRef.current == null) {
            return;
        }
        transformerRef.current.nodes(groupRef.current == null ? [] : [groupRef.current]);
        const layer = transformerRef.current.getLayer();
        if (layer == null) {
            return;
        }
        layer.batchDraw();
    }); // deps=[props.isSelected]だと何故かうまくいかない(isSelectedは最初falseで、クリックなどの操作によって初めてtrueにならないとだめ？)のでdepsは空にしている

    const onDragEnd = (e: KonvaEventObject<unknown>) => {
        if (!props.draggable) {
            return;
        }
        const x = e.target.x();
        const y = e.target.y();
        // セルにスナップする設定の場合、このようにxy座標をリセットしないと少しだけ動かしたときにprops.xとprops.yの値が変わらないため再レンダリングされない。そのため、スナップしない。
        e.target.x(props.x);
        e.target.y(props.y);
        if (props.onDragEnd == null) {
            return;
        }
        props.onDragEnd({
            newLocation: {
                x,
                y,
            },
        });
    };

    return (
        <>
            <ReactKonva.Group
                listening={props.listening}
                ref={groupRef}
                x={props.x}
                y={props.y}
                width={props.w}
                height={props.h}
                draggable={props.draggable}
                onClick={e => {
                    e.cancelBubble = true;
                    props.onClick == null ? undefined : props.onClick();
                }}
                onDblClick={e => {
                    e.cancelBubble = true;
                    props.onDblClick == null ? undefined : props.onDblClick(e);
                }}
                onDragEnd={e => onDragEnd(e)}
                onTouchEnd={e => onDragEnd(e)}
                onMouseEnter={() => {
                    if (props.onMouseEnter == null) {
                        return;
                    }
                    props.onMouseEnter();
                }}
                onMouseLeave={() => {
                    if (props.onMouseLeave == null) {
                        return;
                    }
                    props.onMouseLeave();
                }}
                onTransformEnd={() => {
                    // transformer is changing scale of the node
                    // and NOT its width or height
                    // but in the store we have only width and height
                    // to match the data better we will reset scale on transform end
                    const node = groupRef.current;
                    if (node == null) {
                        return;
                    }
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();

                    // we will reset it back
                    node.scaleX(1);
                    node.scaleY(1);
                    if (props.onDragEnd == null) {
                        return;
                    }
                    props.onDragEnd({
                        newLocation: {
                            x: node.x(),
                            y: node.y(),
                        },
                        newSize: {
                            // set minimal value
                            w: Math.max(imageMinimalSize, node.width() * scaleX),
                            h: Math.max(imageMinimalSize, node.height() * scaleY),
                        },
                    });
                }}
            >
                <ValueContent {...props} />
            </ReactKonva.Group>
            {props.isSelected && (
                <ReactKonva.Transformer
                    ref={transformerRef}
                    rotateEnabled={false}
                    boundBoxFunc={(oldBox, newBox) => {
                        // limit resize
                        if (newBox.width < imageMinimalSize || newBox.height < imageMinimalSize) {
                            return oldBox;
                        }
                        return newBox;
                    }}
                ></ReactKonva.Transformer>
            )}
        </>
    );
};
