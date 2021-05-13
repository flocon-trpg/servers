import produce from 'immer';
import { ReadonlyStateMap } from '../../@shared/StateMap';
import { undefinedForAll } from '../../@shared/utils';
import { BoardLocationOperationInput, BoardLocationsOperationInput, BoardLocationValueState, PieceOperationInput, PiecesOperationInput, PieceValueState, ReplaceBoardLocationOperationInput, ReplacePieceOperationInput, UpdateBoardLocationOperationInput, UpdatePieceOperationInput } from '../../generated/graphql';
import { transform as transformReplace, transformNullable as transformNullableReplace } from './replaceValue';
import { OperationElement, replace } from './types';
import { ReplaceValueOperationModule } from './utils/replaceValueOperation';

export namespace BoardLocation {
    export type State = Omit<BoardLocationValueState, '__typename'>;
    export type PostOperation = BoardLocationOperationInput;
    export type GetOperation = PostOperation;

    export const toGraphQLInput = (source: ReadonlyStateMap<OperationElement<State, PostOperation>>): BoardLocationsOperationInput => {
        const replaces: ReplaceBoardLocationOperationInput[] = [];
        const updates: UpdateBoardLocationOperationInput[] = [];
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
        result.x = ReplaceValueOperationModule.compose(first.x, second.x);
        result.y = ReplaceValueOperationModule.compose(first.y, second.y);
        result.w = ReplaceValueOperationModule.compose(first.w, second.w);
        result.h = ReplaceValueOperationModule.compose(first.h, second.h);

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

        firstPrime.x = transformReplace({ first: first.x, second: second.x }).firstPrime;
        secondPrime.x = transformReplace({ first: first.x, second: second.x }).secondPrime;

        firstPrime.y = transformReplace({ first: first.y, second: second.y }).firstPrime;
        secondPrime.y = transformReplace({ first: first.y, second: second.y }).secondPrime;

        firstPrime.w = transformReplace({ first: first.w, second: second.w }).firstPrime;
        secondPrime.w = transformReplace({ first: first.w, second: second.w }).secondPrime;

        firstPrime.h = transformReplace({ first: first.h, second: second.h }).firstPrime;
        secondPrime.h = transformReplace({ first: first.h, second: second.h }).secondPrime;

        return { firstPrime, secondPrime };
    };

    export const diff = ({
        prev,
        next
    }: {
        prev: State;
        next: State;
    }): GetOperation | undefined => {
        const result: GetOperation = {};

        if (prev.isPrivate != next.isPrivate) {
            result.isPrivate = { newValue: next.isPrivate };
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

        if (undefinedForAll(result)) {
            return undefined;
        }

        return result;
    };

    export const isCursorOnIcon = ({
        state,
        cursorPosition,
    }: {
        state: State;
        cursorPosition: { x: number; y: number };
    }): boolean => {
        const { x, y, w, h } = state;
        return x <= cursorPosition.x && cursorPosition.x <= (x + w) && y <= cursorPosition.y && cursorPosition.y <= (y + h);
    };
}