import { useSpring } from '@react-spring/konva';
import Konva from 'konva';
import { KonvaEventObject, NodeConfig } from 'konva/lib/Node';
import React, { PropsWithChildren } from 'react';
import * as ReactKonva from 'react-konva';
import { KonvaNodeEvents } from 'react-konva';
import { DragEndResult, PixelPosition, PixelSize } from '../../utils/positionAndSizeAndRect';
import { AnimatedGroupAsAnyProps } from '@/components/ui/AnimatedKonvaAsAnyProps/AnimatedKonvaAsAnyProps';

const minimalImageSize = 10;

export type PieceGroupProps = {
    isSelected: boolean;
    draggable: boolean;
    resizable: boolean;
    listening: boolean;
    onDragEnd?: (resize: DragEndResult) => void;
    onClick?: () => void;
    onDblClick?: (e: KonvaEventObject<MouseEvent>) => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
} & PixelPosition &
    PixelSize;

export const PieceGroup: React.FC<PropsWithChildren<PieceGroupProps>> = ({
    isSelected,
    draggable,
    resizable,
    listening,
    onDragEnd: onDragEndProp,
    onClick,
    onDblClick,
    onMouseEnter,
    onMouseLeave,
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

    const konvaGroupStyle: NodeConfig & KonvaNodeEvents = {
        width: w,
        height: h,
        listening,
        draggable,
        onClick: e => {
            e.cancelBubble = true;
            onClick == null ? undefined : onClick();
        },
        onDblClick: e => {
            e.cancelBubble = true;
            onDblClick == null ? undefined : onDblClick(e);
        },
        onDragStart: () => onDragStart(),
        onDragEnd: e => onDragEnd(e),
        onTouchStart: () => onDragStart(),
        onTouchEnd: e => onDragEnd(e),
        onMouseEnter: () => {
            if (onMouseEnter == null) {
                return;
            }
            onMouseEnter();
        },
        onMouseLeave: () => {
            if (onMouseLeave == null) {
                return;
            }
            onMouseLeave();
        },
        onTransformEnd: () => {
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
