import { useSpring } from '@react-spring/konva';
import Konva from 'konva';
import { KonvaEventObject, NodeConfig } from 'konva/lib/Node';
import React, { PropsWithChildren } from 'react';
import * as ReactKonva from 'react-konva';
import { KonvaNodeEvents } from 'react-konva';
import { DragResult, PixelPosition, PixelRect } from '../../utils/positionAndSizeAndRect';
import { NameLabel } from '../Board/subcomponents/components/ImagePiece/subcomponents/NameLabel';
import { AnimatedGroupAsAnyProps } from '@/components/ui/AnimatedKonvaAsAnyProps/AnimatedKonvaAsAnyProps';
import { useLongPress } from '@/hooks/useLongPress';

const minimalImageSize = 10;

export type PieceGroupProps = {
    isSelected: boolean;
    draggable: boolean;
    resizable: boolean;
    listening: boolean;
    label: string | undefined;
    longPress?:
        | {
              enable: true;
              /** 長押しを開始するまでの時間を指定します。*/
              threshold?: number;
          }
        | undefined;
    /** リサイズもしくは移動されたときにトリガーされます。現時点ではリサイズと移動が同時に発生することはありませんが、将来そのような仕様になった場合に対応できるように、リサイズと移動の両方の結果が同時に渡されます。 */
    onDragEnd?: (e: DragResult) => void;
    onClick?: () => void;
    onDblClick?: (e: KonvaEventObject<MouseEvent>) => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onResizeStart?: () => void;
    onResizeEnd?: () => void;
    onMoveStart?: () => void;
    onMove?: (e: { newPosition: PixelPosition }) => void;
    /** クリック長押しの状態の変更を通知します。`longPress?.enable === true` のときにのみ利用可能です。`longPress?.enable !== true` のときの動作は保証されないため利用しないでください。 */
    onLongPressChange?: (isLongPressing: boolean) => void;
} & PixelRect;

export const PieceGroup: React.FC<PropsWithChildren<PieceGroupProps>> = ({
    isSelected,
    draggable,
    resizable,
    listening,
    label,
    longPress,
    onDragEnd: onDragEndProp,
    onClick,
    onDblClick,
    onMouseEnter,
    onMouseLeave,
    onResizeStart,
    onResizeEnd,
    onMoveStart,
    onMove,
    onLongPressChange,
    x,
    y,
    w,
    h,
    children,
}: PropsWithChildren<PieceGroupProps>) => {
    /*
    リサイズや移動の実装方法についてはこちらを参照
    https://konvajs.org/docs/react/Transformer.html
    */

    const suppressSpringRef = React.useRef(false);
    // widthとheightもアニメーションしてみようと思ったができなかったため、とりあえずxとyのみアニメーションしている。
    const springStyleBase = React.useMemo(() => ({ x, y }), [x, y]);
    const springStyle = useSpring({
        to: springStyleBase,
        immediate: () => {
            return suppressSpringRef.current;
        },
        onResolve: () => {
            // onDragEndなどでsuppressSpringRef.currentをfalseにしてもアニメーションは無効化されないため、ここに書いている。
            suppressSpringRef.current = false;
        },
    });
    const groupRef = React.useRef<Konva.Group | null>(null);
    const transformerRef = React.useRef<Konva.Transformer | null>(null);

    const [isLongPressing, setIsLongPressing] = React.useState(false);
    const longPressEvent = useLongPress(
        isLongPressing => {
            setIsLongPressing(isLongPressing);
            onLongPressChange && onLongPressChange(isLongPressing);
        },
        {
            cancelOnMovement: true,
            threshold: longPress?.threshold,
        },
    );

    React.useEffect(() => {
        if (!isSelected) {
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

    const onDragStart = () => {
        suppressSpringRef.current = true;
        onMoveStart && onMoveStart();
    };

    const onDragEnd = (e: KonvaEventObject<unknown>) => {
        if (!draggable) {
            return;
        }
        const x = e.target.x();
        const y = e.target.y();
        // セルにスナップさせる設定の場合、このようにxy座標をリセットしないと少しだけ動かしたときにprops.xとprops.yの値が変わらないため再レンダリングされない。そのため、スナップしない。
        e.target.x(x);
        e.target.y(y);
        if (onDragEndProp != null) {
            onDragEndProp({
                newPosition: {
                    x,
                    y,
                },
            });
        }
    };

    const onDragMove = (e: KonvaEventObject<unknown>) => {
        if (!draggable) {
            return;
        }
        const x = e.target.x();
        const y = e.target.y();
        onMove &&
            onMove({
                newPosition: {
                    x,
                    y,
                },
            });
    };

    const konvaGroupStyle: NodeConfig & KonvaNodeEvents = {
        width: w,
        height: h,
        listening,
        draggable,
        onClick: e => {
            e.cancelBubble = true;
            onClick?.();
        },
        onDblClick: e => {
            e.cancelBubble = true;
            onDblClick?.(e);
        },
        onDragStart: () => onDragStart(),
        onDragEnd: e => onDragEnd(e),
        onTouchStart: () => onDragStart(),
        onTouchEnd: e => onDragEnd(e),
        onDragMove: e => {
            longPressEvent.onDragMove(e.evt);
            onDragMove(e);
        },
        onTouchMove: e => onDragMove(e),
        onMouseDown: e => {
            longPressEvent.onMouseDown(e.evt);
        },
        onMouseUp: () => {
            longPressEvent.onMouseUp();
        },
        onMouseEnter: () => {
            onMouseEnter && onMouseEnter();
        },
        onMouseLeave: () => {
            longPressEvent.onMouseLeave();
            onMouseLeave && onMouseLeave();
        },
        onTransformStart: () => {
            onResizeStart && onResizeStart();
        },
        onTransformEnd: () => {
            onResizeEnd && onResizeEnd();

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
            if (onDragEndProp == null) {
                return;
            }

            onDragEndProp({
                newPosition: {
                    x: node.x(),
                    y: node.y(),
                },
                newSize: {
                    // set minimal value
                    w: Math.max(minimalImageSize, node.width() * scaleX),
                    h: Math.max(minimalImageSize, node.height() * scaleY),
                },
            });
        },
    };

    return (
        <>
            <AnimatedGroupAsAnyProps {...springStyle} {...konvaGroupStyle} ref={groupRef}>
                {children}
                <NameLabel x={0} y={0} w={w} h={h} text={label} />

                {/* 仮の要素 */}
                {longPress?.enable === true && isLongPressing && (
                    <ReactKonva.Rect x={0} y={0} w={w} h={h} text={label} fill="red" />
                )}
            </AnimatedGroupAsAnyProps>
            {isSelected && (
                <ReactKonva.Transformer
                    ref={transformerRef}
                    rotateEnabled={false}
                    resizeEnabled={resizable}
                    boundBoxFunc={(oldBox, newBox) => {
                        // limit resize
                        if (newBox.width < minimalImageSize || newBox.height < minimalImageSize) {
                            return oldBox;
                        }
                        return newBox;
                    }}
                ></ReactKonva.Transformer>
            )}
        </>
    );
};
