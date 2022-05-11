import { OmitVersion, State, boardPositionTemplate } from '@flocon-trpg/core';

type BoardPositionState = OmitVersion<State<typeof boardPositionTemplate>>;

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
