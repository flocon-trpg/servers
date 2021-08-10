import Konva from 'konva';
import { KonvaEventObject } from 'konva/types/Node';
import React, { PropsWithChildren } from 'react';
import * as ReactKonva from 'react-konva';
import { DragEndResult, Size, Vector2 } from '../../utils/types';
import { imageMinimalSize } from './resources';

export type PieceGroupProps = {
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

export const PieceGroup: React.FC<PropsWithChildren<PieceGroupProps>> = ({
    isSelected,
    listening,
    draggable,
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

    const onDragEnd = (e: KonvaEventObject<unknown>) => {
        if (!draggable) {
            return;
        }
        const x = e.target.x();
        const y = e.target.y();
        // セルにスナップする設定の場合、このようにxy座標をリセットしないと少しだけ動かしたときにprops.xとprops.yの値が変わらないため再レンダリングされない。そのため、スナップしない。
        e.target.x(x);
        e.target.y(y);
        if (onDragEndProp == null) {
            return;
        }
        onDragEndProp({
            newLocation: {
                x,
                y,
            },
        });
    };
    return (
        <>
            <ReactKonva.Group
                listening={listening}
                ref={groupRef}
                x={x}
                y={y}
                width={w}
                height={h}
                draggable={draggable}
                onClick={e => {
                    e.cancelBubble = true;
                    onClick == null ? undefined : onClick();
                }}
                onDblClick={e => {
                    e.cancelBubble = true;
                    onDblClick == null ? undefined : onDblClick(e);
                }}
                onDragEnd={e => onDragEnd(e)}
                onTouchEnd={e => onDragEnd(e)}
                onMouseEnter={() => {
                    if (onMouseEnter == null) {
                        return;
                    }
                    onMouseEnter();
                }}
                onMouseLeave={() => {
                    if (onMouseLeave == null) {
                        return;
                    }
                    onMouseLeave();
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
                    if (onDragEndProp == null) {
                        return;
                    }
                    onDragEndProp({
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
                {children}
            </ReactKonva.Group>
            {isSelected && (
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
