import produce from 'immer';
import { ReadonlyStateMap } from '../../@shared/StateMap';
import { BoardOperationInput, BoardsOperationInput, BoardValueState, PieceLocationsOperationInput, ReplaceBoardOperationInput, ReplacePieceLocationOperationInput, UpdateBoardOperationInput, UpdatePieceLocationOperationInput } from '../../generated/graphql';
import { filePathEquals } from './comparer';
import { transform as transformReplace, transformNullable as transformNullableReplace } from './replaceValue';
import { OperationElement, replace } from './types';

export type State = Omit<BoardValueState, '__typename'>;
export type PostOperation = BoardOperationInput;
export type GetOperation = PostOperation;

export const toGraphQLInput = (source: ReadonlyStateMap<OperationElement<State, PostOperation>>): BoardsOperationInput => {
    const replaces: ReplaceBoardOperationInput[] = [];
    const updates: UpdateBoardOperationInput[] = [];
    for (const [key, value] of source) {
        if (value.type === replace) {
            replaces.push({ ...key, newValue: value.newValue });
            continue;
        }
        updates.push({ ...key, operation: value.operation });
    }
    return { replace: replaces, update: updates };
};

export const applyOperation = ({ state, operation }: { state: State; operation: PostOperation | GetOperation }): State => {
    return produce(state, state => {
        if (operation.backgroundImage != null) {
            state.backgroundImage = operation.backgroundImage.newValue;
        }
        if (operation.cellColumnCount != null) {
            state.cellColumnCount = operation.cellColumnCount.newValue;
        }
        if (operation.cellHeight != null) {
            state.cellHeight = operation.cellHeight.newValue;
        }
        if (operation.cellOffsetX != null) {
            state.cellOffsetX = operation.cellOffsetX.newValue;
        }
        if (operation.cellOffsetY != null) {
            state.cellOffsetY = operation.cellOffsetY.newValue;
        }
        if (operation.cellRowCount != null) {
            state.cellRowCount = operation.cellRowCount.newValue;
        }
        if (operation.cellWidth != null) {
            state.cellWidth = operation.cellWidth.newValue;
        }
        if (operation.name != null) {
            state.name = operation.name.newValue;
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
    if (second.backgroundImage != null) {
        result.backgroundImage = second.backgroundImage;
    }
    if (second.cellColumnCount != null) {
        result.cellColumnCount = second.cellColumnCount;
    }
    if (second.cellHeight != null) {
        result.cellHeight = second.cellHeight;
    }
    if (second.cellOffsetX != null) {
        result.cellOffsetX = second.cellOffsetX;
    }
    if (second.cellOffsetY != null) {
        result.cellOffsetY = second.cellOffsetY;
    }
    if (second.cellRowCount != null) {
        result.cellRowCount = second.cellRowCount;
    }
    if (second.cellWidth != null) {
        result.cellWidth = second.cellWidth;
    }
    if (second.name != null) {
        result.name = second.name;
    }
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

    firstPrime.backgroundImage = transformNullableReplace({ first: first.backgroundImage, second: second.backgroundImage }).firstPrime;
    secondPrime.backgroundImage = transformNullableReplace({ first: first.backgroundImage, second: second.backgroundImage }).secondPrime;

    firstPrime.cellColumnCount = transformReplace({ first: first.cellColumnCount, second: second.cellColumnCount }).firstPrime;
    secondPrime.cellColumnCount = transformReplace({ first: first.cellColumnCount, second: second.cellColumnCount }).secondPrime;

    firstPrime.cellHeight = transformReplace({ first: first.cellHeight, second: second.cellHeight }).firstPrime;
    secondPrime.cellHeight = transformReplace({ first: first.cellHeight, second: second.cellHeight }).secondPrime;

    firstPrime.cellOffsetX = transformReplace({ first: first.cellOffsetX, second: second.cellOffsetX }).firstPrime;
    secondPrime.cellOffsetX = transformReplace({ first: first.cellOffsetX, second: second.cellOffsetX }).secondPrime;

    firstPrime.cellOffsetY = transformReplace({ first: first.cellOffsetY, second: second.cellOffsetY }).firstPrime;
    secondPrime.cellOffsetY = transformReplace({ first: first.cellOffsetY, second: second.cellOffsetY }).secondPrime;
    
    firstPrime.cellRowCount = transformReplace({ first: first.cellRowCount, second: second.cellRowCount }).firstPrime;
    secondPrime.cellRowCount = transformReplace({ first: first.cellRowCount, second: second.cellRowCount }).secondPrime;

    firstPrime.cellWidth = transformReplace({ first: first.cellWidth, second: second.cellWidth }).firstPrime;
    secondPrime.cellWidth = transformReplace({ first: first.cellWidth, second: second.cellWidth }).secondPrime;

    firstPrime.name = transformReplace({ first: first.name, second: second.name }).firstPrime;
    secondPrime.name = transformReplace({ first: first.name, second: second.name }).secondPrime;

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

    if (!filePathEquals(prev.backgroundImage, next.backgroundImage)) {
        if (next.backgroundImage == null) {
            result.backgroundImage = { newValue: next.backgroundImage };
        } else {
            // __typenameなどがあると400 Bad Requestが返されるようなので、除去している
            result.backgroundImage = {
                newValue: {
                    path: next.backgroundImage.path,
                    sourceType: next.backgroundImage.sourceType,
                }
            };
        }
    }
    if (prev.cellColumnCount != next.cellColumnCount) {
        result.cellColumnCount = { newValue: next.cellColumnCount };
    }
    if (prev.cellHeight != next.cellHeight) {
        result.cellHeight = { newValue: next.cellHeight };
    }
    if (prev.cellOffsetX != next.cellOffsetX) {
        result.cellOffsetX = { newValue: next.cellOffsetX };
    }
    if (prev.cellOffsetY != next.cellOffsetY) {
        result.cellOffsetY = { newValue: next.cellOffsetY };
    }
    if (prev.cellRowCount != next.cellRowCount) {
        result.cellRowCount = { newValue: next.cellRowCount };
    }
    if (prev.cellWidth != next.cellWidth) {
        result.cellWidth = { newValue: next.cellWidth };
    }
    if (prev.name != next.name) {
        result.name = { newValue: next.name };
    }

    return result;
};