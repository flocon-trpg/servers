import produce from 'immer';
import { ReadonlyStateMap } from '../../@shared/StateMap';
import { PieceOperationInput, PiecesOperationInput, PieceValueState, ReplacePieceOperationInput, UpdatePieceOperationInput } from '../../generated/graphql';
import { transform as transformReplace, transformNullable as transformNullableReplace } from './replaceValue';
import { OperationElement, replace } from './types';
import { ReplaceValueOperationModule } from './utils/replaceValueOperation';

export namespace Piece {
    export type State = Omit<PieceValueState, '__typename'>;
    export type PostOperation = PieceOperationInput;
    export type GetOperation = PostOperation;

    export const toGraphQLInput = (source: ReadonlyStateMap<OperationElement<State, PostOperation>>): PiecesOperationInput => {
        const replaces: ReplacePieceOperationInput[] = [];
        const updates: UpdatePieceOperationInput[] = [];
        for (const [key, value] of source) {
            if (value.type === replace) {
                replaces.push({ boardId: key.id, boardCreatedBy: key.createdBy, newValue: value.newValue });
                continue;
            }
            updates.push({ boardId: key.id, boardCreatedBy: key.createdBy, operation: value.operation });
        }
        return { replace: replaces, update: updates };
    };

    export const applyOperation = ({ state, operation }: { state: State; operation: PostOperation | GetOperation }): State => {
        return produce(state, state => {
            if (operation.isPrivate != null) {
                state.isPrivate = operation.isPrivate.newValue;
            }
            if (operation.isCellMode != null) {
                state.isCellMode = operation.isCellMode.newValue;
            }
            if (operation.x != null) {
                state.x = operation.x.newValue;
            }
            if (operation.y != null) {
                state.y = operation.y.newValue;
            }
            if (operation.w != null) {
                state.w = operation.w.newValue;
            }
            if (operation.h != null) {
                state.h = operation.h.newValue;
            }
            if (operation.cellX != null) {
                state.cellX = operation.cellX.newValue;
            }
            if (operation.cellY != null) {
                state.cellY = operation.cellY.newValue;
            }
            if (operation.cellW != null) {
                state.cellW = operation.cellW.newValue;
            }
            if (operation.cellH != null) {
                state.cellH = operation.cellH.newValue;
            }
        });
    };

    export const compose = ({
        first,
        second
    }: {
        first: PostOperation;
        second: PostOperation;
    }): PostOperation => {
        const result: PostOperation = { ...first };

        result.isPrivate = ReplaceValueOperationModule.compose(first.isPrivate, second.isPrivate);
        result.isCellMode = ReplaceValueOperationModule.compose(first.isCellMode, second.isCellMode);
        result.x = ReplaceValueOperationModule.compose(first.x, second.x);
        result.y = ReplaceValueOperationModule.compose(first.y, second.y);
        result.w = ReplaceValueOperationModule.compose(first.w, second.w);
        result.h = ReplaceValueOperationModule.compose(first.h, second.h);
        result.cellX = ReplaceValueOperationModule.compose(first.cellX, second.cellX);
        result.cellY = ReplaceValueOperationModule.compose(first.cellY, second.cellY);
        result.cellW = ReplaceValueOperationModule.compose(first.cellW, second.cellW);
        result.cellH = ReplaceValueOperationModule.compose(first.cellH, second.cellH);

        return result;
    };

    export const transform = ({
        first,
        second
    }: {
        first: GetOperation;
        second: PostOperation;
    }): { firstPrime: GetOperation; secondPrime: PostOperation } => {
        const firstPrime: PostOperation = {};
        const secondPrime: PostOperation = {};

        firstPrime.isPrivate = transformReplace({ first: first.isPrivate, second: second.isPrivate }).firstPrime;
        secondPrime.isPrivate = transformReplace({ first: first.isPrivate, second: second.isPrivate }).secondPrime;

        firstPrime.isCellMode = transformReplace({ first: first.isCellMode, second: second.isCellMode }).firstPrime;
        secondPrime.isCellMode = transformReplace({ first: first.isCellMode, second: second.isCellMode }).secondPrime;

        firstPrime.x = transformReplace({ first: first.x, second: second.x }).firstPrime;
        secondPrime.x = transformReplace({ first: first.x, second: second.x }).secondPrime;

        firstPrime.y = transformReplace({ first: first.y, second: second.y }).firstPrime;
        secondPrime.y = transformReplace({ first: first.y, second: second.y }).secondPrime;

        firstPrime.w = transformReplace({ first: first.w, second: second.w }).firstPrime;
        secondPrime.w = transformReplace({ first: first.w, second: second.w }).secondPrime;

        firstPrime.h = transformReplace({ first: first.h, second: second.h }).firstPrime;
        secondPrime.h = transformReplace({ first: first.h, second: second.h }).secondPrime;

        firstPrime.cellX = transformReplace({ first: first.cellX, second: second.cellX }).firstPrime;
        secondPrime.cellX = transformReplace({ first: first.cellX, second: second.cellX }).secondPrime;

        firstPrime.cellY = transformReplace({ first: first.cellY, second: second.cellY }).firstPrime;
        secondPrime.cellY = transformReplace({ first: first.cellY, second: second.cellY }).secondPrime;

        firstPrime.cellW = transformReplace({ first: first.cellW, second: second.cellW }).firstPrime;
        secondPrime.cellW = transformReplace({ first: first.cellW, second: second.cellW }).secondPrime;

        firstPrime.cellH = transformReplace({ first: first.cellH, second: second.cellH }).firstPrime;
        secondPrime.cellH = transformReplace({ first: first.cellH, second: second.cellH }).secondPrime;

        return { firstPrime, secondPrime };
    };

    export const diff = ({
        prev,
        next
    }: {
        prev: State;
        next: State;
    }): GetOperation => {
        const result: GetOperation = {};

        if (prev.isPrivate != next.isPrivate) {
            result.isPrivate = { newValue: next.isPrivate };
        }
        if (prev.isCellMode != next.isCellMode) {
            result.isCellMode = { newValue: next.isCellMode };
        }
        if (prev.x != next.x) {
            result.x = { newValue: next.x };
        }
        if (prev.y != next.y) {
            result.y = { newValue: next.y };
        }
        if (prev.w != next.w) {
            result.w = { newValue: next.w };
        }
        if (prev.h != next.h) {
            result.h = { newValue: next.h };
        }
        if (prev.cellX != next.cellX) {
            result.cellX = { newValue: next.cellX };
        }
        if (prev.cellY != next.cellY) {
            result.cellY = { newValue: next.cellY };
        }
        if (prev.cellW != next.cellW) {
            result.cellW = { newValue: next.cellW };
        }
        if (prev.cellH != next.cellH) {
            result.cellH = { newValue: next.cellH };
        }

        return result;
    };

    export const getPosition = ({
        state,
        cellWidth,
        cellHeight,
        cellOffsetX,
        cellOffsetY,
    }: {
        state: State;
        cellWidth: number;
        cellHeight: number;
        cellOffsetX: number;
        cellOffsetY: number;
    }): { x: number; y: number; w: number; h: number } => {
        return {
            x: state.isCellMode ? (state.cellX * cellWidth + cellOffsetX) : state.x,
            y: state.isCellMode ? (state.cellY * cellHeight + cellOffsetY) : state.y,
            w: state.isCellMode ? (state.cellW * cellWidth) : state.w,
            h: state.isCellMode ? (state.cellH * cellHeight) : state.h,
        };
    };

    export const isCursorOnIcon = ({
        state,
        cellWidth,
        cellHeight,
        cursorPosition,
        cellOffsetX,
        cellOffsetY,
    }: {
        state: State;
        cellWidth: number;
        cellHeight: number;
        cursorPosition: { x: number; y: number };
        cellOffsetX: number;
        cellOffsetY: number;
    }): boolean => {
        const { x, y, w, h } = getPosition({ state, cellWidth, cellHeight, cellOffsetX, cellOffsetY });
        return x <= cursorPosition.x && cursorPosition.x <= (x + w) && y <= cursorPosition.y && cursorPosition.y <= (y + h);
    };
}