import * as BoardLocationModule from '../@shared/ot/boardLocation/v1';

export namespace BoardLocation {
    export const isCursorOnIcon = ({
        state,
        cursorPosition,
    }: {
        state: BoardLocationModule.State;
        cursorPosition: { x: number; y: number };
    }): boolean => {
        const { x, y, w, h } = state;
        return x <= cursorPosition.x && cursorPosition.x <= (x + w) && y <= cursorPosition.y && cursorPosition.y <= (y + h);
    };
}