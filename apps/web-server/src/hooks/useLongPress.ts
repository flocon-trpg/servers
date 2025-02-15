import React from 'react';
import { useLatest } from 'react-use';
import { Vector2 } from '@/components/models/room/Room/subcomponents/utils/positionAndSizeAndRect';

// react-use にも useLongPress があるが、長押しをやめたことがわかる機能がないため使えない。use-long-press というライブラリだと、onTouchStart 関数等を Konva の Group 等で実行する際に、onTouchStart(e) の e の型が React の Event でなく、Konva の KonvaEventObject であるため、型エラーが発生する。そのため、独自に useLongPress を作成した。
/** 指定した時間以上クリックし続けたかどうかを判定します。
 *
 * @example
 *
 * ```tsx
 * const longPressEvent = useLongPress(isLongPressing => console.log(isLongPressing));
 * ```
 *
 * return <div {...longPressEvent}>Content</div>
 */
export const useLongPress = (
    callback: (isLongPressing: boolean) => void,
    {
        threshold = 300,
        cancelOnMovement = false,
    }: {
        threshold?: number;
        cancelOnMovement?: boolean;
    },
) => {
    const mouseDownRef = React.useRef<
        { timeout: number | NodeJS.Timeout; mouseDownPosition: Vector2 } | undefined
    >(undefined);

    const clearTimeoutRef = () => {
        mouseDownRef.current && clearTimeout(mouseDownRef.current.timeout);
        mouseDownRef.current = undefined;
    };

    React.useEffect(() => {
        return clearTimeoutRef();
    }, []);

    const oldValueRef = React.useRef<boolean>(false);
    const callbackRef = useLatest(callback);
    const next = React.useCallback(
        (newValue: boolean) => {
            if (oldValueRef.current === newValue) {
                return;
            }
            oldValueRef.current = newValue;
            callbackRef.current(newValue);
        },
        [callbackRef],
    );
    const stop = React.useCallback(() => {
        clearTimeoutRef();
        next(false);
    }, [next]);

    const onMouseDown = (e: MouseEvent) => {
        // 左クリックが含まれていないときはスキップ。ただ、代わりに「return e.buttons !== 1」として、左クリック以外が同時に押されているときもスキップする手もあり、どちらがいいかは要検討。
        if (e.buttons % 2 !== 1) {
            return;
        }

        const mousePosition = { x: e.clientX, y: e.clientY };

        mouseDownRef.current = {
            timeout: setTimeout(() => {
                const mouseDown = mouseDownRef.current;
                if (mouseDown == null) {
                    return;
                }
                next(true);
            }, threshold),
            mouseDownPosition: mousePosition,
        };
    };

    const onDragMove = (e: DragEvent) => {
        if (!cancelOnMovement) {
            return;
        }
        const mouseDown = mouseDownRef.current;
        if (mouseDown == null) {
            return;
        }
        // クリック後、この距離以上マウスが動いたときは長押しをやめる。
        // TODO: この値は適当であるため、要調整。
        const maxDistance = 10;
        if (
            (mouseDown.mouseDownPosition.x - e.clientX) ** 2 +
                (mouseDown.mouseDownPosition.y - e.clientY) ** 2 >=
            maxDistance ** 2
        ) {
            stop();
        }
    };

    return {
        onMouseDown,
        onMouseUp: stop,
        onDragMove,
        onMouseLeave: stop,
    };
};
