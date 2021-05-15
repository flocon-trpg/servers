import * as t from 'io-ts';
import { CustomResult, ResultModule } from '../../../Result';
import * as TextOperationCore from '../../../textOperation';

const retain = 'retain';
const insert = 'insert';
const delete$ = 'delete';

const downOperationUnit = t.union([
    t.type({
        type: t.literal(retain),
        retain: t.number,
    }),
    t.type({
        type: t.literal(insert),
        insert: t.number,
    }),
    t.type({
        type: t.literal(delete$),
        delete: t.string,
    }),
]);

export const downOperation = t.array(downOperationUnit);
export type DownOperation = t.TypeOf<typeof downOperation>

const upOperationUnit = t.union([
    t.type({
        type: t.literal(retain),
        retain: t.number,
    }),
    t.type({
        type: t.literal(insert),
        insert: t.string,
    }),
    t.type({
        type: t.literal(delete$),
        delete: t.number,
    }),
]);

export const upOperation = t.array(upOperationUnit);
export type UpOperation = t.TypeOf<typeof upOperation>

export type TwoWayOperation = ({
    type: typeof retain;
    retain: number;
} | {
    type: typeof insert;
    insert: string;
} | {
    type: typeof delete$;
    delete: string;
})[]

export const apply = (state: string, action: UpOperation | TwoWayOperation) => {
    const action$ = TextOperationCore.TextUpOperation.ofUnit(action);
    if (action$ == null) {
        return ResultModule.ok(state);
    }
    return TextOperationCore.TextUpOperation.apply({ prevState: state, action: action$ });
};

export const applyBack = (state: string, action: DownOperation) => {
    const action$ = TextOperationCore.TextDownOperation.ofUnit(action);
    if (action$ == null) {
        return ResultModule.ok(state);
    }
    return TextOperationCore.TextDownOperation.applyBack({ nextState: state, action: action$ });
};

export const composeDownOperation = (first: DownOperation | undefined, second: DownOperation | undefined): CustomResult<DownOperation | undefined, TextOperationCore.ComposeAndTransformError> => {
    const first$ = first == null ? undefined : TextOperationCore.TextDownOperation.ofUnit(first);
    const second$ = second == null ? undefined : TextOperationCore.TextDownOperation.ofUnit(second);
    if (first$ == null) {
        return ResultModule.ok(second);
    }
    if (second$ == null) {
        return ResultModule.ok(first);
    }
    const result = TextOperationCore.TextDownOperation.compose({ first: first$, second: second$ });
    if (result.isError) {
        return result;
    }
    return ResultModule.ok(TextOperationCore.TextDownOperation.toUnit(result.value));
};

export const restore = ({ nextState, downOperation }: { nextState: string; downOperation: DownOperation | undefined }) => {
    const downOperation$ = downOperation == null ? undefined : TextOperationCore.TextDownOperation.ofUnit(downOperation);
    if (downOperation$ == null) {
        return ResultModule.ok({
            prevState: nextState,
            twoWayOperation: undefined,
        });
    }
    const result = TextOperationCore.TextDownOperation.applyBackAndRestore({ nextState, action: downOperation$ });
    if (result.isError) {
        return result;
    }
    return ResultModule.ok({
        prevState: result.value.prevState,
        twoWayOperation: TextOperationCore.TextTwoWayOperation.toUnit(result.value.restored),
    });
};

export const transform = ({
    first,
    second,
    prevState,
}: {
    first?: TwoWayOperation;
    second?: UpOperation;
    prevState: string;
}) => {
    const first$ = first == null ? undefined : TextOperationCore.TextTwoWayOperation.ofUnit(first);
    if (first$ === undefined) {
        const second$ = second == null ? undefined : TextOperationCore.TextUpOperation.ofUnit(second);
        if (second$ === undefined) {
            return ResultModule.ok({
                firstPrime: undefined,
                secondPrime: undefined,
            });
        }
        const restoreResult = TextOperationCore.TextUpOperation.applyAndRestore({ prevState, action: second$ });
        if (restoreResult.isError) {
            return restoreResult;
        }
        return ResultModule.ok({
            firstPrime: undefined,
            secondPrime: TextOperationCore.TextTwoWayOperation.toUnit(restoreResult.value.restored),
        });
    }
    const second$ = second == null ? undefined : TextOperationCore.TextUpOperation.ofUnit(second);
    if (second$ === undefined) {
        return ResultModule.ok({
            firstPrime: first$,
            secondPrime: undefined
        });
    }
    const secondResult = TextOperationCore.TextUpOperation.applyAndRestore({ prevState, action: second$ });
    if (secondResult.isError) {
        return secondResult;
    }
    const result = TextOperationCore.TextTwoWayOperation.transform({ first: first$, second: secondResult.value.restored });
    if (result.isError) {
        return result;
    }
    return ResultModule.ok({
        firstPrime: TextOperationCore.TextTwoWayOperation.toUnit(result.value.firstPrime),
        secondPrime: TextOperationCore.TextTwoWayOperation.toUnit(result.value.secondPrime),
    });
};

export const diff = ({ prev, next }: { prev: string; next: string }): TwoWayOperation => {
    return TextOperationCore.TextTwoWayOperation.toUnit(TextOperationCore.TextTwoWayOperation.diff({ first: prev, second: next }));
};

const diffToUpOperation = ({ prev, next }: { prev: string; next: string }): UpOperation => {
    const twoWayOperation = TextOperationCore.TextTwoWayOperation.diff({ first: prev, second: next });
    const upOperation = TextOperationCore.TextTwoWayOperation.toUpOperation(twoWayOperation);
    return TextOperationCore.TextUpOperation.toUnit(upOperation);
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    const twoWayOperation = TextOperationCore.TextTwoWayOperation.ofUnit(source);
    if (twoWayOperation == null) {
        throw new Error('This should not happen');
    }
    const upOperation = TextOperationCore.TextTwoWayOperation.toUpOperation(twoWayOperation);
    return TextOperationCore.TextUpOperation.toUnit(upOperation);
};

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    const twoWayOperation = TextOperationCore.TextTwoWayOperation.ofUnit(source);
    if (twoWayOperation == null) {
        throw new Error('This should not happen');
    }
    const downOperation = TextOperationCore.TextTwoWayOperation.toDownOperation(twoWayOperation);
    return TextOperationCore.TextDownOperation.toUnit(downOperation);
};

// Ensure this:
// - diff(oldValue) = newValue
export const toPrivateClientOperation = ({
    oldValue,
    newValue,
    diff,
    createdByMe,
}: {
    oldValue: {
        isValuePrivate: boolean;
        value: string;
    };
    newValue: {
        isValuePrivate: boolean;
        value: string;
    };
    diff: TwoWayOperation | undefined;
    createdByMe: boolean;
}): UpOperation | undefined => {
    if (oldValue.isValuePrivate && !createdByMe) {
        if (newValue.isValuePrivate && !createdByMe) {
            return undefined;
        }
        return diffToUpOperation({ prev: '', next: newValue.value });
    }
    if (newValue.isValuePrivate && !createdByMe) {
        return diffToUpOperation({ prev: oldValue.value, next: '' });
    }
    if (diff == null) {
        return undefined;
    }
    return toUpOperation(diff);
};