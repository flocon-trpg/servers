import Konva from 'konva';
import { KonvaEventObject } from 'konva/types/Node';
import React from 'react';
import { success, useImageFromGraphQL } from '../hooks/image';
import { FilePath } from '../utils/types';
import * as ReactKonva from 'react-konva';
import { MyNumberValue } from '../stateManagers/states/myNumberValue';
import { usePrevious } from '../hooks/usePrevious';
import { animated, useSpring, useTransition } from '@react-spring/konva';
import { RoomPublicMessageFragment } from '../generated/graphql';
import produce from 'immer';
import { __ } from '../@shared/collection';
import { interval } from 'rxjs';
import { isDeleted, toText as toTextCore } from '../utils/message';

export namespace MyKonva {
    export type Vector2 = {
        x: number;
        y: number;
    }

    export type Size = {
        w: number;
        h: number;
    }

    export type DragEndResult = {
        readonly newLocation?: Vector2;
        readonly newSize?: Size;
    }

    type BalloonCoreProps = {
        text0?: string;
        text1?: string;
        text2?: string;
        text3?: string;
        text4?: string;
        x: number;
        y: number;
        width: number;
    }

    // BalloonCoreにおける1つのtextのheight。BalloonCore全体のheightはtextHeight*5になる
    const balloonCoreTextHeight = 72;

    const BalloonCore: React.FC<BalloonCoreProps> = ({
        text0,
        text1,
        text2,
        text3,
        text4,
        x,
        y,
        width,
    }: BalloonCoreProps) => {
        const labelOpacity = 0.8;

        const transitions0 = useTransition(text0, {
            from: { opacity: 0 },
            enter: { opacity: labelOpacity},
            leave: { opacity: 0 },
        });
        const transitions1 = useTransition(text1, {
            from: { opacity: 0 },
            enter: { opacity: labelOpacity},
            leave: { opacity: 0 },
        });
        const transitions2 = useTransition(text2, {
            from: { opacity: 0 },
            enter: { opacity: labelOpacity },
            leave: { opacity: 0 },
        });
        const transitions3 = useTransition(text3, {
            from: { opacity: 0 },
            enter: { opacity: labelOpacity },
            leave: { opacity: 0 },
        });
        const transitions4 = useTransition(text4, {
            from: { opacity: 0 },
            enter: { opacity: labelOpacity },
            leave: { opacity: 0 },
        });

        const createLabel = (textIndex: 0 | 1 | 2 | 3 | 4) => {
            const transitions = [transitions0, transitions1, transitions2, transitions3, transitions4][textIndex];
            return transitions((style, item) => {
                return <animated.Group
                    {...style}>
                    {<ReactKonva.Label
                        x={width / 2}
                        y={balloonCoreTextHeight * (textIndex + 1)}
                        width={width}
                        height={balloonCoreTextHeight}>
                        <ReactKonva.Tag
                            strokeWidth={0}
                            fill='#303030'
                            shadowColor='black'
                            shadowBlur={5}
                            shadowOffsetX={5}
                            shadowOffsetY={5}
                            shadowOpacity={0.3}
                            pointerWidth={6}
                            pointerHeight={6}
                            pointerDirection='down'
                            lineJoin='round'/>
                        <ReactKonva.Text
                            text={item}
                            fontFamily='Noto Sans JP Regular'
                            fontSize={14}
                            padding={4}
                            fill='white'
                            verticalAlign='middle'
                            width={width}
                            height={balloonCoreTextHeight - 7}
                            wrap='word'
                            ellipsis />
                    </ReactKonva.Label>}
                </animated.Group>;
            });
        };

        return <animated.Group
            x={x}
            y={y}
            width={width}
            height={balloonCoreTextHeight * 5}>
            {createLabel(0)}
            {createLabel(1)}
            {createLabel(2)}
            {createLabel(3)}
            {createLabel(4)}
        </animated.Group>;
    };

    type BalloonProps = {
        message?: RoomPublicMessageFragment;
        x: number;
        y: number;
        width: number;
        onBalloonChange: (balloonExists: boolean) => void;
    }

    // 💬を表すコンポーネント。
    const Balloon: React.FC<BalloonProps> = ({
        message,
        x,
        y,
        width,
        onBalloonChange,
    }: BalloonProps) => {
        const onTextsChangeRef = React.useRef(onBalloonChange);
        React.useEffect(() => {
            onTextsChangeRef.current = onBalloonChange;
        }, [onBalloonChange]);

        // indexが小さいほどcreatedAtが大きい(新しい)。
        const [recentMessages, setRecentMessages] = React.useState<ReadonlyArray<RoomPublicMessageFragment>>([]);

        // 書き込みがあってから💬を画面上にどれだけの期間表示させるか。ただし、サーバーやクライアントの時刻のずれに影響されるため、これらが合っていないと表示期間がゼロになったり短くなったり長くなったりする。
        const timeWindow = 30 * 1000;

        React.useEffect(() => {
            if (message == null) {
                return;
            }

            const now = new Date().getTime();
            setRecentMessages(recentMessages => {
                if (recentMessages.some(msg => msg.messageId === message.messageId) || now - message.createdAt > timeWindow) {
                    return recentMessages;
                }
                return [...recentMessages, message].sort((x, y) => y.createdAt - x.createdAt);
            });
        }, [message, timeWindow]);

        // このuseEffectで、recentMessagesの要素数が大きくなることで負荷がかかることを防いでいる。
        React.useEffect(() => {
            const unsubscribe = interval(2000).subscribe(() => {
                setRecentMessages(recentMessages => {
                    const now = new Date().getTime();
                    return [...recentMessages].filter(msg => now - msg.createdAt <= timeWindow);
                });
            });
            return () => unsubscribe.unsubscribe();
        }, [timeWindow]);

        const texts = [...recentMessages]
            .filter(msg => !isDeleted(msg))
            .sort((x, y) => y.createdAt - x.createdAt);
            
        const toText = (message: RoomPublicMessageFragment | null | undefined): string | undefined => {
            if (message == null) {
                return undefined;
            }
            const text = toTextCore(message);
            if (text == null) {
                return undefined;
            }
            return `${text} ${message.commandResult?.text ?? ''}`;
        };

        const [text0, text1, text2, text3, text4] = [
            toText(texts[4]),
            toText(texts[3]),
            toText(texts[2]),
            toText(texts[1]),
            toText(texts[0]),
        ];

        const [areAllTextsUndefined, setAreAllTextUndefined] = React.useState([text0, text1, text2, text3, text4].every(t => t === undefined));
        React.useEffect(() => {
            setAreAllTextUndefined([text0, text1, text2, text3, text4].every(t => t === undefined));
        }, [text0, text1, text2, text3, text4]);
        React.useEffect(() => {
            onTextsChangeRef.current(!areAllTextsUndefined);
        }, [areAllTextsUndefined]);

        return <BalloonCore
            x={x}
            y={y}
            width={width}
            text0={text0}
            text1={text1}
            text2={text2}
            text3={text3}
            text4={text4} />;
    };

    const imageMinimalSize = 10;

    type ImageProps = {
        filePath: FilePath;
        isSelected: boolean;
        draggable: boolean;
        listening: boolean;
        opacity?: number;

        // (messageFilter(message) ? message : undefined)の値をxとする。xが変わるたび、そのメッセージが💬として表示される。ただし、undefinedになったときは何も起こらない(💬が消えることもない)。
        // 💬を使いたくない場合は常にundefinedにすればよい。
        message?: RoomPublicMessageFragment;

        // undefinedならば(x => true)とみなされる。
        // messageが常にundefinedならばこれもundefinedにしてよい。
        // re-renderのたびに実行されるため、軽量なおかつ副作用のない関数を用いることを強く推奨。
        messageFilter?: (message: RoomPublicMessageFragment) => boolean;

        onDragEnd?: (resize: DragEndResult) => void;
        onClick?: () => void;
    } & Vector2 & Size

    export const Image: React.FC<ImageProps> = (props: ImageProps) => {
        /*
        リサイズや移動の実装方法についてはこちらを参照
        https://konvajs.org/docs/react/Transformer.html
        */

        const [opacitySpringProps, setOpacitySpringProps] = useSpring(() => ({
            config: {
                duration: 100,
            },
            to: {
                opacity: props.opacity ?? 1,
            }
        }), []);

        const messageFilterRef = React.useRef(props.messageFilter ?? (() => true));
        React.useEffect(() => {
            messageFilterRef.current = props.messageFilter ?? (() => true);
        }, [props.messageFilter]);

        const image = useImageFromGraphQL(props.filePath);
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

        if (image.type !== success) {
            return null;
        }

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
                }
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
                    onDragEnd={e => onDragEnd(e)}
                    onTouchEnd={e => onDragEnd(e)}
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
                                h: Math.max(imageMinimalSize, node.height() * scaleY)
                            },
                        });
                    }}>
                    <animated.Image
                        {...opacitySpringProps}
                        x={0}
                        y={0}
                        width={props.w}
                        height={props.h}
                        image={image.image}
                    />
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
                        }}>
                    </ReactKonva.Transformer>
                )}
                <Balloon
                    x={props.x}
                    y={props.y - (balloonCoreTextHeight * 5)}
                    width={props.w}
                    message={props.message == null ? undefined : (messageFilterRef.current(props.message) ? props.message : undefined)}
                    onBalloonChange={balloonExists => {
                        setOpacitySpringProps({ opacity: balloonExists ? 1 : (props.opacity ?? 1) });
                    }} />
            </>
        );
    };

    type MyNumberValueProps = {
        myNumberValue: MyNumberValue.State;
        createdByMe: boolean;

        isSelected: boolean;
        draggable: boolean;
        listening: boolean;

        onDragEnd?: (resize: DragEndResult) => void;
        onClick?: () => void;

    } & Vector2 & Size

    export const MyNumberValue: React.FC<MyNumberValueProps> = (props: MyNumberValueProps) => {
        /*
        リサイズや移動の実装方法についてはこちらを参照
        https://konvajs.org/docs/react/Transformer.html
        */

        let text: string;
        if (props.myNumberValue.isValuePrivate && !props.createdByMe) {
            text = '?';
        } else {
            const number = props.myNumberValue.value?.toString() ?? 'null';
            if (props.myNumberValue.isValuePrivate) {
                text = `(${number})`;
            } else {
                text = number;
            }
        }
        const prevText = usePrevious(text);

        const duration = 300;

        const [textSpringProps] = useSpring(() => ({
            config: {
                duration,
            },
            from: {
                text: (prevText === '?' || text === '?') ? prevText : text,
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
                    await next({
                    });
                }
                await next({
                    text,
                    scaleX: 1,
                    x: 0,
                });
            }
        }), [text]);

        const baseColor = '#F0F0F0FF';
        const transitionColor = '#A0F0F0FF';
        const [rectSpringProps] = useSpring(() => ({
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
                    await next({
                    });
                }
                await next({
                    scaleX: 1,
                    x: 0,
                    fill: baseColor,
                });
            }
        }), [text]);

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
                }
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
                    onDragEnd={e => onDragEnd(e)}
                    onTouchEnd={e => onDragEnd(e)}
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
                                h: Math.max(imageMinimalSize, node.height() * scaleY)
                            },
                        });
                    }}>
                    <animated.Rect
                        {...rectSpringProps}
                        y={0}
                        width={props.w}
                        height={props.h}
                        strokeWidth={2}
                        stroke='#606060B0'
                        cornerRadius={5} />
                    {
                        /* fontSizeの決め方は適当 */
                    }
                    <animated.Text
                        {...textSpringProps}
                        y={0}
                        width={props.w}
                        height={props.h}
                        fontSize={props.w / 2.5}
                        fontFamily='Noto Sans JP Regular'
                        fill='black'
                        align='center'
                        verticalAlign='middle' />
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
                        }}>
                    </ReactKonva.Transformer>
                )}
            </>
        );
    };
}