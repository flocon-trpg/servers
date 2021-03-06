import Konva from 'konva';
import { KonvaEventObject } from 'konva/types/Node';
import React from 'react';
import { success, useImageFromGraphQL } from '../hooks/image';
import { FilePath } from '../utils/types';
import * as ReactKonva from 'react-konva';
import { MyNumberValue } from '../stateManagers/states/myNumberValue';

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

    const iconImageMinimalSize = 10;

    type IconImageProps = {
        filePath: FilePath;
        isSelected: boolean;
        draggable: boolean;
        listening: boolean;

        onDragEnd?: (resize: DragEndResult) => void;
        onClick?: () => void;
    } & Vector2 & Size

    export const IconImage: React.FC<IconImageProps> = (props: IconImageProps) => {
        /*
        リサイズや移動の実装方法についてはこちらを参照
        https://konvajs.org/docs/react/Transformer.html
        */

        const image = useImageFromGraphQL(props.filePath);
        const imageRef = React.useRef<Konva.Image | null>(null);
        const transformerRef = React.useRef<Konva.Transformer | null>(null);

        React.useEffect(() => {
            if (!props.isSelected) {
                return;
            }
            if (transformerRef.current == null) {
                return;
            }
            transformerRef.current.nodes(imageRef.current == null ? [] : [imageRef.current]);
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
                <ReactKonva.Image
                    listening={props.listening}
                    ref={imageRef}
                    x={props.x}
                    y={props.y}
                    width={props.w}
                    height={props.h}
                    image={image.image}
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
                        const node = imageRef.current;
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
                                w: Math.max(iconImageMinimalSize, node.width() * scaleX),
                                h: Math.max(iconImageMinimalSize, node.height() * scaleY)
                            },
                        });
                    }} />
                {props.isSelected && (
                    <ReactKonva.Transformer
                        ref={transformerRef}
                        rotateEnabled={false}
                        boundBoxFunc={(oldBox, newBox) => {
                            // limit resize
                            if (newBox.width < iconImageMinimalSize || newBox.height < iconImageMinimalSize) {
                                return oldBox;
                            }
                            return newBox;
                        }}>
                    </ReactKonva.Transformer>
                )}
            </>
        );
    };

    type MyNumberValueProps = {
        myNumberValue: MyNumberValue.State;
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

        const layerRef = React.useRef<Konva.Layer | null>(null);
        const transformerRef = React.useRef<Konva.Transformer | null>(null);

        React.useEffect(() => {
            if (!props.isSelected) {
                return;
            }
            if (transformerRef.current == null) {
                return;
            }
            transformerRef.current.nodes(layerRef.current == null ? [] : [layerRef.current]);
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
                    ref={layerRef}
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
                        const node = layerRef.current;
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
                                w: Math.max(iconImageMinimalSize, node.width() * scaleX),
                                h: Math.max(iconImageMinimalSize, node.height() * scaleY)
                            },
                        });
                    }}>
                    <ReactKonva.Rect
                        x={0}
                        y={0}
                        width={props.w}
                        height={props.h}
                        stroke=''
                        fill='#80808080'/>
                    {/* fontSizeの決め方は適当 */}
                    <ReactKonva.Text
                        x={0}
                        y={0}
                        width={props.w}
                        height={props.h}
                        text={props.myNumberValue.value?.toString() ?? '?'}
                        fontSize={props.w / 2}
                        fill='#555'
                        align='center'
                        verticalAlign='middle' />
                </ReactKonva.Group>
                {props.isSelected && (
                    <ReactKonva.Transformer
                        ref={transformerRef}
                        rotateEnabled={false}
                        boundBoxFunc={(oldBox, newBox) => {
                            // limit resize
                            if (newBox.width < iconImageMinimalSize || newBox.height < iconImageMinimalSize) {
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