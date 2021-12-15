/*
This code is a derived code of react-rnd https://github.com/bokuweb/react-rnd .
The license of react-rnd is as follows:

The MIT License (MIT)

Copyright (c) 2017 @bokuweb

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// react-rndは2021/11/18時点でReact@17に対応していないようで、yarn pnpを適用する際に不都合があったため、react-rndを参考に作成した。
// ……が、yarn pnpの導入は見送られる可能性が高くなってきたため、現在の存在意義は微妙かもしれない。

import React, { PropsWithChildren } from 'react';
import Draggable, { ControlPosition } from 'react-draggable';
import { NumberSize, Resizable, ResizeDirection, Size } from 're-resizable';
import { useLatest } from 'react-use';

const resizableStyle: React.CSSProperties = {
    width: 'auto',
    height: 'auto',
    display: 'inline-block',
    position: 'absolute',
    top: 0,
    left: 0,
};

export type Props = {
    cancel?: string;
    position?: ControlPosition;
    minHeight?: string | number;
    minWidth?: string | number;
    size?: Size;
    style?: React.CSSProperties;
    onDragStop?: (data: ControlPosition) => void;
    onResize?: (dir: ResizeDirection, delta: NumberSize) => void;
    onResizeStop?: (dir: ResizeDirection, delta: NumberSize) => void;
    onMouseDown?: (e: MouseEvent) => void;
};

export const Rnd: React.FC<PropsWithChildren<Props>> = ({
    children,
    cancel,
    position,
    minHeight,
    minWidth,
    size,
    style,
    onResize,
    onDragStop,
    onResizeStop,
    onMouseDown,
}: PropsWithChildren<Props>) => {
    const resizableRef = React.useRef<Resizable | null>(null);
    const draggableRef = React.useRef<Draggable | null>(null);
    const [isResizing, setIsResizing] = React.useState(false);
    const [offsetFromParentLeft, setOffsetFromParentLeft] = React.useState(0);
    const [offsetFromParentTop, setOffsetFromParentTop] = React.useState(0);
    const [originalPositionX, setOriginalPositionX] = React.useState(0);
    const [originalPositionY, setOriginalPositionY] = React.useState(0);
    const offsetFromParentRef = useLatest({ left: offsetFromParentLeft, top: offsetFromParentTop });
    const getParent = React.useCallback(() => {
        return resizableRef.current?.parentNode;
    }, []);
    const getSelfElement = React.useCallback(() => {
        return resizableRef.current?.resizable;
    }, []);
    const getDraggablePosition = React.useCallback(() => {
        const state = draggableRef.current?.state as any;
        const x: unknown = state?.x;
        const y: unknown = state?.y;
        if (typeof x !== 'number') {
            throw new Error('type error. x should be number');
        }
        if (typeof y !== 'number') {
            throw new Error('type error. y should be number');
        }
        return { x, y };
    }, []);
    const updateOffsetFromParent = React.useCallback(() => {
        const scale = 1;
        const parent = getParent();
        const self = getSelfElement();
        if (parent == null || self == null) {
            return {
                top: 0,
                left: 0,
            };
        }
        const parentRect = parent.getBoundingClientRect();
        const parentLeft = parentRect.left;
        const parentTop = parentRect.top;
        const selfRect = self.getBoundingClientRect();
        const position = getDraggablePosition();
        const scrollLeft = parent.scrollLeft;
        const scrollTop = parent.scrollTop;
        setOffsetFromParentLeft(selfRect.left - parentLeft + scrollLeft - position.x * scale);
        setOffsetFromParentTop(selfRect.top - parentTop + scrollTop - position.y * scale);
    }, [getDraggablePosition, getParent, getSelfElement]);

    React.useEffect(() => {
        updateOffsetFromParent();
        const { x, y } = getDraggablePosition();
        const { left, top } = offsetFromParentRef.current;
        draggableRef.current?.setState({
            x: x - left,
            y: y - top,
        });
    }, [getDraggablePosition, offsetFromParentRef, updateOffsetFromParent]);

    const draggablePosition =
        position == null
            ? undefined
            : { x: position.x - offsetFromParentLeft, y: position.y - offsetFromParentTop };

    return (
        <Draggable
            ref={draggableRef}
            cancel={cancel}
            position={isResizing ? undefined : draggablePosition}
            onStart={() => {
                const pos = getDraggablePosition();
                setOriginalPositionX(pos.x);
                setOriginalPositionY(pos.y);
                updateOffsetFromParent();
            }}
            onStop={(e, data) => {
                if (onDragStop == null) {
                    return;
                }
                onDragStop({ x: data.x + offsetFromParentLeft, y: data.y + offsetFromParentTop });
            }}
            onMouseDown={onMouseDown}
        >
            <Resizable
                ref={resizableRef}
                size={size}
                onResizeStart={e => {
                    e.stopPropagation();
                    setIsResizing(true);
                    const pos = getDraggablePosition();
                    setOriginalPositionX(pos.x);
                    setOriginalPositionY(pos.y);
                }}
                onResize={(e, direction, elementRef, delta) => {
                    const newPos = { x: originalPositionX, y: originalPositionY };
                    const left = -delta.width;
                    const top = -delta.height;
                    const directions = ['top', 'left', 'topLeft', 'bottomLeft', 'topRight'];

                    if (directions.indexOf(direction) !== -1) {
                        if (direction === 'bottomLeft') {
                            newPos.x += left;
                        } else if (direction === 'topRight') {
                            newPos.y += top;
                        } else {
                            newPos.x += left;
                            newPos.y += top;
                        }
                    }

                    const draggablePosition = getDraggablePosition();
                    if (newPos.x !== draggablePosition.x || newPos.y !== draggablePosition.y) {
                        draggableRef.current?.setState(newPos);
                    }

                    updateOffsetFromParent();
                    if (onResize != null) {
                        onResize(direction, delta);
                    }
                }}
                onResizeStop={(e, dir, elementRef, delta) => {
                    setIsResizing(false);
                    if (onResizeStop != null) {
                        onResizeStop(dir, delta);
                    }
                }}
                style={{ ...resizableStyle, cursor: 'move', ...style }}
                minWidth={minWidth}
                minHeight={minHeight}
            >
                {children}
            </Resizable>
        </Draggable>
    );
};
