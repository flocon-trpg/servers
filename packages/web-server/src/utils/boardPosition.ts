import { BoardPositionState } from '@flocon-trpg/core';

export namespace BoardPosition {
    export const isCursorOnIcon = ({
        state,
        cursorPosition,
    }: {
        state: BoardPositionState;
        cursorPosition: { x: number; y: number };
    }): boolean => {
        const { x, y, w, h } = state;
        return (
            x <= cursorPosition.x &&
            cursorPosition.x <= x + w &&
            y <= cursorPosition.y &&
            cursorPosition.y <= y + h
        );
    };
}
