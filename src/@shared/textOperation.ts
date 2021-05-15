import { Option, OptionModule } from './Option';
import { CustomResult, Result, ResultModule } from './Result';
// TODO: @sharedをnpmにpublishしたら、api_serverとweb_serverのpackage.jsonからdiff-match-patchと@types/diff-match-patchを削除する。
import { diff_match_patch } from 'diff-match-patch';
import { __ } from './collection';

export class PositiveInt {
    public constructor(private source: number) {
        if (!Number.isInteger(source)) {
            throw 'not integer';
        }
        if (source < 1) {
            throw 'less than 1';
        }
    }

    public get value(): number {
        return this.source;
    }

    public static get one(): PositiveInt {
        return new PositiveInt(1);
    }

    public get successor(): PositiveInt {
        return new PositiveInt(this.source + 1);
    }

    public static add(x: PositiveInt, y: PositiveInt): PositiveInt {
        return new PositiveInt(x.value + y.value);
    }

    public static tryCreate(source: number): PositiveInt | undefined {
        if (!Number.isInteger(source)) {
            return undefined;
        }
        if (source < 1) {
            return undefined;
        }
        return new PositiveInt(source);
    }
}

export class NonEmptyString {
    public constructor(private source: string) {
        if (source === '') {
            throw 'empty string';
        }
    }

    public get value(): string {
        return this.source;
    }

    public get length(): PositiveInt {
        return new PositiveInt(this.source.length);
    }

    public concat(other: NonEmptyString): NonEmptyString {
        return new NonEmptyString(this.value + other.value);
    }

    public static tryCreate(source: string): NonEmptyString | undefined {
        if (source === '') {
            return undefined;
        }
        return new NonEmptyString(source);
    }
}

type Factory<TInsert, TDelete> = {
    getInsertLength(insert: TInsert): PositiveInt;
    getDeleteLength(del: TDelete): PositiveInt;
    concatInsert(first: TInsert, second: TInsert): TInsert;
    concatDelete(first: TDelete, second: TDelete): TDelete;
}

export const insert$ = 'insert';
export const delete$ = 'delete'; // deleteという変数名は使えない。insertやreplaceも$をつけることで統一している。
const replace$ = 'replace';

type Insert<TInsert> = {
    type: typeof insert$;
    insert: TInsert;
    delete?: undefined;
}

type Delete<TDelete> = {
    type: typeof delete$;
    insert?: undefined;
    delete: TDelete;
}

type Replace<TInsert, TDelete> = {
    type: typeof replace$;
    insert: TInsert;
    delete: TDelete;
}

type EditElement<TInsert, TDelete> = Insert<TInsert> | Delete<TDelete> | Replace<TInsert, TDelete>;

const prevLengthOfEditElement = <TInsert, TDelete>(source: EditElement<TInsert, TDelete>, factory: Factory<TInsert, TDelete>) => source.delete === undefined ? 0 : factory.getDeleteLength(source.delete).value;

const nextLengthOfEditElement = <TInsert, TDelete>(source: EditElement<TInsert, TDelete>, factory: Factory<TInsert, TDelete>) => source.insert === undefined ? 0 : factory.getInsertLength(source.insert).value;

const mapEditElement = <TInsert1, TInsert2, TDelete1, TDelete2>({
    source,
    mapInsert,
    mapDelete
}: {
    source: EditElement<TInsert1, TDelete1>;
    mapInsert: (source: TInsert1) => TInsert2;
    mapDelete: (source: TDelete1) => TDelete2;
}): EditElement<TInsert2, TDelete2> => {
    switch (source.type) {
        case insert$:
            return {
                type: insert$,
                insert: mapInsert(source.insert),
            };
        case delete$:
            return {
                type: delete$,
                delete: mapDelete(source.delete),
            };
        case replace$:
            return {
                type: replace$,
                insert: mapInsert(source.insert),
                delete: mapDelete(source.delete),
            };
    }
};

const insertToEditElement = <TInsert, TDelete>(source: EditElement<TInsert, TDelete>, insert: TInsert, concat: (first: TInsert, second: TInsert) => TInsert): EditElement<TInsert, TDelete> => {
    switch (source.type) {
        case insert$:
            return {
                type: insert$,
                insert: concat(source.insert, insert),
            };
        case delete$:
            return {
                type: replace$,
                insert: insert,
                delete: source.delete,
            };
        case replace$:
            return {
                type: replace$,
                insert: concat(source.insert, insert),
                delete: source.delete,
            };
    }
};

const deleteToEditElement = <TInsert, TDelete>(source: EditElement<TInsert, TDelete>, del: TDelete, concat: (first: TDelete, second: TDelete) => TDelete): EditElement<TInsert, TDelete> => {
    switch (source.type) {
        case insert$:
            return {
                type: replace$,
                insert: source.insert,
                delete: del,
            };
        case delete$:
            return {
                type: delete$,
                delete: concat(source.delete, del),
            };
        case replace$:
            return {
                type: replace$,
                insert: source.insert,
                delete: concat(source.delete, del),
            };
    }
};

const invertEditElement = <T1, T2>(source: EditElement<T1, T2>): EditElement<T2, T1> => {
    switch (source.type) {
        case insert$:
            return {
                type: delete$,
                delete: source.insert,
            };
        case delete$:
            return {
                type: insert$,
                insert: source.delete,
            };
        case replace$:
            return {
                type: replace$,
                insert: source.delete,
                delete: source.insert,
            };
    }
};

export const retain = 'retain';
export const edit = 'edit';

type TextOperationArrayElement<TInsert, TDelete> = {
    type: typeof retain;
    retain: PositiveInt;
} | {
    type: typeof edit;
    edit: EditElement<TInsert, TDelete>;
}

const prevLengthOfTextOperationElementArray = <TInsert, TDelete>(source: ReadonlyArray<TextOperationArrayElement<TInsert, TDelete>>, getDeleteLength: (del: TDelete) => PositiveInt) => {
    return source.reduce((seed, elem) => {
        switch (elem.type) {
            case retain:
                return seed + elem.retain.value;
            default:
                return seed + (elem.edit.delete === undefined ? 0 : getDeleteLength(elem.edit.delete).value);
        }
    }, 0);
};

type TextOperationUnit<TInsert, TDelete> = {
    type: typeof retain;
    retain: PositiveInt;
} | {
    type: typeof insert$;
    insert: TInsert;
} | {
    type: typeof delete$;
    delete: TDelete;
}

const prevLengthOfTextOperationUnitArray = <TInsert, TDelete>(source: ReadonlyArray<TextOperationUnit<TInsert, TDelete>>, factory: Factory<TInsert, TDelete>) => {
    return source.reduce((seed, elem) => {
        switch (elem.type) {
            case retain:
                return seed + elem.retain.value;
            default:
                return seed + prevLengthOfEditElement(elem, factory);
        }
    }, 0);
};

const nextLengthOfTextOperationUnitArray = <TInsert, TDelete>(source: ReadonlyArray<TextOperationUnit<TInsert, TDelete>>, factory: Factory<TInsert, TDelete>) => {
    return source.reduce((seed, elem) => {
        switch (elem.type) {
            case retain:
                return seed + elem.retain.value;
            default:
                return seed + nextLengthOfEditElement(elem, factory);
        }
    }, 0);
};

type TextOperationElement<TInsert, TDelete> = {
    firstRetain: PositiveInt;
    secondEdit: EditElement<TInsert, TDelete>;
}

const mapTextOperationElement = <TInsert1, TInsert2, TDelete1, TDelete2>({
    source,
    mapInsert,
    mapDelete
}: {
    source: TextOperationElement<TInsert1, TDelete1>;
    mapInsert: (source: TInsert1) => TInsert2;
    mapDelete: (source: TDelete1) => TDelete2;
}): TextOperationElement<TInsert2, TDelete2> => {
    return {
        ...source,
        secondEdit: mapEditElement({ source: source.secondEdit, mapInsert, mapDelete }),
    };
};

const invertTextOperationElement = <T1, T2>(source: TextOperationElement<T1, T2>): TextOperationElement<T2, T1> => {
    return {
        ...source,
        secondEdit: invertEditElement(source.secondEdit),
    };
};

type TextOperation<TInsert, TDelete> = {
    headEdit?: EditElement<TInsert, TDelete>;
    body: ReadonlyArray<TextOperationElement<TInsert, TDelete>>;
    tailRetain?: PositiveInt;
}

const mapTextOperation = <TInsert1, TInsert2, TDelete1, TDelete2>({
    source,
    mapInsert,
    mapDelete
}: {
    source: TextOperation<TInsert1, TDelete1>;
    mapInsert: (source: TInsert1) => TInsert2;
    mapDelete: (source: TDelete1) => TDelete2;
}): TextOperation<TInsert2, TDelete2> => {
    return {
        headEdit: source.headEdit === undefined ? source.headEdit : mapEditElement({ source: source.headEdit, mapInsert, mapDelete }),
        body: source.body.map(body => mapTextOperationElement({ source: body, mapInsert, mapDelete })),
        tailRetain: source.tailRetain,
    };
};

class TextOperationBuilder<TInsert, TDelete> {
    public constructor(private factory: Factory<TInsert, TDelete>, source?: TextOperation<TInsert, TDelete>) {
        if (source == null) {
            return;
        }
        this.headEdit = source.headEdit ?? null;
        this.body = [...source.body];
        this.tailRetain = source.tailRetain ?? 0;
    }

    private headEdit: EditElement<TInsert, TDelete> | null = null;
    private readonly body: TextOperationElement<TInsert, TDelete>[] = [];
    private tailRetain: PositiveInt | 0 = 0;

    public retain(count: PositiveInt): void {
        if (this.tailRetain === 0) {
            this.tailRetain = count;
            return;
        }
        this.tailRetain = PositiveInt.add(this.tailRetain, count);
    }

    public insert(insert: TInsert): void {
        if (this.tailRetain !== 0) {
            this.body.push({
                firstRetain: this.tailRetain,
                secondEdit: {
                    type: insert$,
                    insert,
                }
            });
            this.tailRetain = 0;
            return;
        }
        if (this.body.length !== 0) {
            const last = this.body[this.body.length - 1];
            this.body[this.body.length - 1] = {
                ...last,
                secondEdit: insertToEditElement(last.secondEdit, insert, this.factory.concatInsert),
            };
            return;
        }
        if (this.headEdit == null) {
            this.headEdit = {
                type: insert$,
                insert,
                delete: undefined,
            };
            return;
        }
        this.headEdit = insertToEditElement(this.headEdit, insert, this.factory.concatInsert);
    }

    public delete(del: TDelete): void {
        if (this.tailRetain !== 0) {
            this.body.push({
                firstRetain: this.tailRetain,
                secondEdit: {
                    type: delete$,
                    delete: del,
                }
            });
            this.tailRetain = 0;
            return;
        }
        if (this.body.length !== 0) {
            const last = this.body[this.body.length - 1];
            this.body[this.body.length - 1] = {
                ...last,
                secondEdit: deleteToEditElement(last.secondEdit, del, this.factory.concatDelete),
            };
            return;
        }
        if (this.headEdit == null) {
            this.headEdit = {
                type: delete$,
                insert: undefined,
                delete: del,
            };
            return;
        }
        this.headEdit = deleteToEditElement(this.headEdit, del, this.factory.concatDelete);
    }

    public edit(edit: EditElement<TInsert, TDelete>) {
        if (edit.delete !== undefined) {
            this.delete(edit.delete);
        }
        if (edit.insert !== undefined) {
            this.insert(edit.insert);
        }
    }

    public onArrayElement(arrayElement: TextOperationArrayElement<TInsert, TDelete>) {
        switch (arrayElement.type) {
            case retain:
                this.retain(arrayElement.retain);
                return;
            case edit:
                this.edit(arrayElement.edit);
        }
    }

    public onUnit(unit: TextOperationUnit<TInsert, TDelete>) {
        if (unit.type === retain) {
            this.retain(unit.retain);
            return;
        }
        this.edit(unit);
    }

    public build(): TextOperation<TInsert, TDelete> {
        return {
            headEdit: this.headEdit ?? undefined,
            body: [...this.body],
            tailRetain: this.tailRetain === 0 ? undefined : this.tailRetain,
        };
    }

    public * toIterable(): IterableIterator<TextOperationArrayElement<TInsert, TDelete>> {
        const operation = this.build();
        if (operation.headEdit != null) {
            yield { type: edit, edit: operation.headEdit };
        }
        for (const body of operation.body) {
            yield { type: retain, retain: body.firstRetain };
            yield { type: edit, edit: body.secondEdit };
        }
        if (operation.tailRetain != null) {
            yield { type: retain, retain: operation.tailRetain };
        }
    }

    public * toUnits(): IterableIterator<TextOperationUnit<TInsert, TDelete>> {
        for (const elem of this.toIterable()) {
            if (elem.type === retain) {
                yield { type: retain, retain: elem.retain };
                continue;
            }
            if (elem.edit.delete !== undefined) {
                yield { type: delete$, delete: elem.edit.delete };
            }
            if (elem.edit.insert !== undefined) {
                yield { type: insert$, insert: elem.edit.insert };
            }
        }
    }
}

const replace = ({ source, start, count, replacement }: { source: string; start: number; count: number; replacement: string }): { deleted: string; newValue: string } | null => {
    if (source.length < start + count) {
        return null;
    }
    const deleted = source.substring(start, start + count);
    return { newValue: source.substring(0, start) + replacement + source.substring(start + count), deleted };
};

export const deleteStringNotMatch = 'deleteStringNotMatch';
export const stateTooShort = 'stateTooShort';
export const stateTooLong = 'stateTooLong';

export type ApplyError<TDelete> = {
    type: typeof stateTooShort;
} | {
    type: typeof stateTooLong;
} | {
    type: typeof deleteStringNotMatch;
    startCharIndex: number;
    expected: TDelete;
    actual: NonEmptyString;
}

const applyAndRestoreCore = <TDelete1, TDelete2>({
    state,
    action,
    getDeleteLength,
    restoreOption,
    mapping,
}: {
    state: string;
    action: ReadonlyArray<TextOperationArrayElement<NonEmptyString, TDelete1>>;
    getDeleteLength(del: TDelete1): PositiveInt;

    // restoreOptionがundefined ⇔ 戻り値のrestoredがnon-undefined
    restoreOption?: {
        factory: Factory<NonEmptyString, TDelete2>;
    };

    // Noneを返すと、expectedとactualが異なるとみなしてエラーになる。expectedがPositiveIntなどのときは常にSomeを返せばよい。
    // restoreOption === undefinedのとき、TDelete2は使われないのでOkの値は何でもいい。
    mapping: (params: { expected: TDelete1; actual: NonEmptyString }) => Option<TDelete2>;
}): CustomResult<{ newState: string; restored?: TextOperation<NonEmptyString, TDelete2> }, ApplyError<TDelete1>> => {
    const prevLength = prevLengthOfTextOperationElementArray(action, getDeleteLength);
    if (state.length < prevLength) {
        return ResultModule.error({ type: stateTooShort });
    }
    if (state.length > prevLength) {
        return ResultModule.error({ type: stateTooLong });
    }

    let result = state;
    let cursor = 0;
    const builder = restoreOption == null ? undefined : new TextOperationBuilder<NonEmptyString, TDelete2>(restoreOption.factory);

    for (const act of action) {
        switch (act.type) {
            case retain: {
                cursor += act.retain.value;
                builder?.retain(act.retain);
                break;
            }
            case edit: {
                const replacement = act.edit.insert?.value ?? '';
                const replaceResult = replace({
                    source: result,
                    start: cursor,
                    count: act.edit.delete == null ? 0 : getDeleteLength(act.edit.delete).value,
                    replacement,
                });
                if (replaceResult == null) {
                    return ResultModule.error({
                        type: stateTooShort,
                    });
                }
                if (act.edit.delete != null) {
                    const deleted = new NonEmptyString(replaceResult.deleted);
                    const mapped = mapping({ expected: act.edit.delete, actual: deleted });
                    if (!mapped.hasValue) {
                        return ResultModule.error({
                            type: deleteStringNotMatch,
                            startCharIndex: cursor,
                            expected: act.edit.delete,
                            actual: deleted,
                        });
                    }
                    builder?.delete(mapped.value);
                }
                if (act.edit.insert !== undefined) {
                    builder?.insert(act.edit.insert);
                }
                result = replaceResult.newValue;
                cursor += replacement.length;
            }
        }
    }

    return ResultModule.ok({ newState: result, restored: builder?.build() });
};

const secondTooShort = 'secondTooShort';
const secondTooLong = 'secondTooLong';

export type ComposeAndTransformError = {
    type: typeof secondTooShort;
} | {
    type: typeof secondTooLong;
}

// 実装にあたって https://github.com/Operational-Transformation/ot.js/blob/e9a3a0e214dd6c001e25515274bae0842a8415f2/lib/text-operation.js#L238 を参考にした
const composeCore = <TInsert, TDelete>({
    first: $first,
    second: $second,
    factory,
    splitDelete: splitDeleteCore,
    splitInsert: splitInsertCore,
}: {
    first: ReadonlyArray<TextOperationUnit<TInsert, TDelete>>;
    second: ReadonlyArray<TextOperationUnit<TInsert, TDelete>>;

    // 例:
    // ('foo', 1) -> [ 'f', 'oo' ]
    // (5, 2) -> [2, (5 - 2)]
    //
    // 範囲外のindexが渡されることはない。
    splitDelete: (target: TDelete, index: PositiveInt) => [TDelete, TDelete];

    // splitDeleteと同様。
    splitInsert: (target: TInsert, index: PositiveInt) => [TInsert, TInsert];

    factory: Factory<TInsert, TDelete>;
}): CustomResult<TextOperation<TInsert, TDelete>, ComposeAndTransformError> => {
    const nextLengthOfFirst = nextLengthOfTextOperationUnitArray($first, factory);
    const prevLengthOfSecond = prevLengthOfTextOperationUnitArray($second, factory);
    if (nextLengthOfFirst < prevLengthOfSecond) {
        return ResultModule.error({ type: secondTooLong });
    }
    if (nextLengthOfFirst > prevLengthOfSecond) {
        return ResultModule.error({ type: secondTooShort });
    }

    const first = [...$first];
    const second = [...$second];
    let firstShift: TextOperationUnit<TInsert, TDelete> | undefined = undefined;
    let secondShift: TextOperationUnit<TInsert, TDelete> | undefined = undefined;

    const builder = new TextOperationBuilder<TInsert, TDelete>(factory);

    // eslint-disable-next-line no-constant-condition
    while (true) {
        if (firstShift === undefined) {
            firstShift = first.shift();
        }
        if (secondShift === undefined) {
            secondShift = second.shift();
        }

        if (firstShift === undefined) {
            if (secondShift === undefined) {
                return ResultModule.ok(builder.build());
            }
            builder.onUnit(secondShift);
            secondShift = undefined;
            continue;
        }
        if (secondShift === undefined) {
            builder.onUnit(firstShift);
            firstShift = undefined;
            continue;
        }

        if (firstShift.type === delete$) {
            builder.delete(firstShift.delete);
            firstShift = undefined;
            continue;
        }

        if (secondShift.type === insert$) {
            builder.insert(secondShift.insert);
            secondShift = undefined;
            continue;
        }

        if (firstShift.type === retain) {
            if (secondShift.type === retain) {
                if (firstShift.retain.value < secondShift.retain.value) {
                    builder.retain(firstShift.retain);
                    secondShift = {
                        type: retain,
                        retain: new PositiveInt(secondShift.retain.value - firstShift.retain.value),
                    };
                    firstShift = undefined;
                    continue;
                }
                if (firstShift.retain.value === secondShift.retain.value) {
                    builder.retain(firstShift.retain);
                    firstShift = secondShift = undefined;
                    continue;
                }
                builder.retain(secondShift.retain);
                firstShift = {
                    type: retain,
                    retain: new PositiveInt(firstShift.retain.value - secondShift.retain.value),
                };
                secondShift = undefined;
                continue;
            }

            if (secondShift.type === delete$) {
                const secondShiftDeleteLength = factory.getDeleteLength(secondShift.delete);
                if (firstShift.retain.value < secondShiftDeleteLength.value) {
                    const [intersection, remaining] = splitDeleteCore(secondShift.delete, firstShift.retain);
                    builder.delete(intersection);
                    secondShift = {
                        type: delete$,
                        delete: remaining,
                    };
                    firstShift = undefined;
                    continue;
                }
                if (firstShift.retain.value === secondShiftDeleteLength.value) {
                    builder.delete(secondShift.delete);
                    firstShift = secondShift = undefined;
                    continue;
                }
                builder.delete(secondShift.delete);
                firstShift = {
                    type: retain,
                    retain: new PositiveInt(firstShift.retain.value - secondShiftDeleteLength.value),
                };
                secondShift = undefined;
                continue;
            }

            throw 'This should not happen.';
        }

        if (secondShift.type === retain) {
            const firstShiftInsertLength = factory.getInsertLength(firstShift.insert);
            if (firstShiftInsertLength.value < secondShift.retain.value) {
                builder.insert(firstShift.insert);
                secondShift = {
                    type: retain,
                    retain: new PositiveInt(secondShift.retain.value - firstShiftInsertLength.value),
                };
                firstShift = undefined;
                continue;
            }
            if (firstShiftInsertLength.value === secondShift.retain.value) {
                builder.insert(firstShift.insert);
                firstShift = secondShift = undefined;
                continue;
            }
            const [intersection, remaining] = splitInsertCore(firstShift.insert, secondShift.retain);
            builder.insert(intersection);
            firstShift = {
                type: insert$,
                insert: remaining,
            };
            secondShift = undefined;
            continue;
        }

        const firstShiftInsertLength = factory.getInsertLength(firstShift.insert);
        const secondShiftDeleteLength = factory.getDeleteLength(secondShift.delete);
        if (firstShiftInsertLength.value < secondShiftDeleteLength.value) {
            const [, remaining] = splitDeleteCore(secondShift.delete, firstShiftInsertLength);
            firstShift = undefined;
            secondShift = {
                type: delete$,
                delete: remaining,
            };
            continue;
        }
        if (firstShiftInsertLength.value === secondShiftDeleteLength.value) {
            firstShift = secondShift = undefined;
            continue;
        }
        const [, remaining] = splitInsertCore(firstShift.insert, secondShiftDeleteLength);
        firstShift = {
            type: insert$,
            insert: remaining,
        };
        secondShift = undefined;
        continue;
    }
};

const transformCore = <TInsert, TDelete>({
    first: $first,
    second: $second,
    factory,
    splitDelete: splitDeleteCore,
}: {
    first: ReadonlyArray<TextOperationUnit<TInsert, TDelete>>;
    second: ReadonlyArray<TextOperationUnit<TInsert, TDelete>>;

    // 例:
    // ('foo', 1) -> [ 'f', 'oo' ]
    // (5, 2) -> [2, (5 - 2)]
    //
    // 範囲外のindexが渡されることはない。
    splitDelete: (target: TDelete, index: PositiveInt) => [TDelete, TDelete];

    factory: Factory<TInsert, TDelete>;
}): CustomResult<{ firstPrime: TextOperation<TInsert, TDelete>; secondPrime: TextOperation<TInsert, TDelete> }, ComposeAndTransformError> => {
    const prevLengthOfFirst = prevLengthOfTextOperationUnitArray($first, factory);
    const prevLengthOfSecond = prevLengthOfTextOperationUnitArray($second, factory);
    if (prevLengthOfFirst < prevLengthOfSecond) {
        return ResultModule.error({ type: secondTooLong });
    }
    if (prevLengthOfFirst > prevLengthOfSecond) {
        return ResultModule.error({ type: secondTooShort });
    }


    const first = [...$first];
    const second = [...$second];
    let firstShift: TextOperationUnit<TInsert, TDelete> | undefined = undefined;
    let secondShift: TextOperationUnit<TInsert, TDelete> | undefined = undefined;

    const firstPrime = new TextOperationBuilder<TInsert, TDelete>(factory);
    const secondPrime = new TextOperationBuilder<TInsert, TDelete>(factory);

    // eslint-disable-next-line no-constant-condition
    while (true) {
        if (firstShift === undefined) {
            firstShift = first.shift();
        }
        if (secondShift === undefined) {
            secondShift = second.shift();
        }

        if (firstShift === undefined) {
            if (secondShift === undefined) {
                return ResultModule.ok({ firstPrime: firstPrime.build(), secondPrime: secondPrime.build() });
            }
            if (secondShift.type === insert$) {
                firstPrime.retain(factory.getInsertLength(secondShift.insert));
            }
            secondPrime.onUnit(secondShift);
            secondShift = undefined;
            continue;
        }
        if (secondShift === undefined) {
            firstPrime.onUnit(firstShift);
            if (firstShift.type === insert$) {
                secondPrime.retain(factory.getInsertLength(firstShift.insert));
            }
            firstShift = undefined;
            continue;
        }

        // insert, *

        if (firstShift.type === insert$) {
            firstPrime.insert(firstShift.insert);
            secondPrime.retain(factory.getInsertLength(firstShift.insert));
            firstShift = undefined;
            continue;
        }

        // *, insert

        if (secondShift.type === insert$) {
            firstPrime.retain(factory.getInsertLength(secondShift.insert));
            secondPrime.insert(secondShift.insert);
            secondShift = undefined;
            continue;
        }

        if (firstShift.type === retain) {
            if (secondShift.type === retain) {

                // retain, retain

                if (firstShift.retain.value < secondShift.retain.value) {
                    firstPrime.retain(firstShift.retain);
                    secondPrime.retain(firstShift.retain);
                    secondShift = { type: retain, retain: new PositiveInt(secondShift.retain.value - firstShift.retain.value) };
                    firstShift = undefined;
                    continue;
                }
                if (firstShift.retain.value === secondShift.retain.value) {
                    firstPrime.retain(firstShift.retain);
                    secondPrime.retain(firstShift.retain);
                    firstShift = secondShift = undefined;
                    continue;
                }
                firstPrime.retain(secondShift.retain);
                secondPrime.retain(secondShift.retain);
                firstShift = { type: retain, retain: new PositiveInt(firstShift.retain.value - secondShift.retain.value) };
                secondShift = undefined;
                continue;
            }

            // retain, delete

            const secondShiftDeleteLength = factory.getDeleteLength(secondShift.delete);
            if (firstShift.retain.value < secondShiftDeleteLength.value) {
                const [intersection, newSecondShift] = splitDeleteCore(secondShift.delete, firstShift.retain);
                secondPrime.delete(intersection);
                firstShift = undefined;
                secondShift = {
                    type: delete$,
                    delete: newSecondShift,
                };
                continue;
            }

            if (firstShift.retain.value === secondShiftDeleteLength.value) {
                secondPrime.delete(secondShift.delete);
                firstShift = undefined;
                secondShift = undefined;
                continue;
            }

            // firstShift.retain.value > secondShiftDeleteLength.value
            secondPrime.delete(secondShift.delete);
            firstShift = {
                type: retain,
                retain: new PositiveInt(firstShift.retain.value - secondShiftDeleteLength.value)
            };
            secondShift = undefined;
            continue;
        }

        if (secondShift.type === retain) {

            // delete, retain

            const firstShiftDeleteLength = factory.getDeleteLength(firstShift.delete);
            if (secondShift.retain.value < firstShiftDeleteLength.value) {
                const [intersection, newFirstShift] = splitDeleteCore(firstShift.delete, secondShift.retain);
                firstPrime.delete(intersection);
                firstShift = {
                    type: delete$,
                    delete: newFirstShift
                };
                secondShift = undefined;
                continue;
            }

            if (secondShift.retain.value === firstShiftDeleteLength.value) {
                firstPrime.delete(firstShift.delete);
                firstShift = undefined;
                secondShift = undefined;
                continue;
            }

            // secondShift.retain.value > firstShiftDeleteLength.value
            firstPrime.delete(firstShift.delete);
            firstShift = undefined;
            secondShift = {
                type: retain,
                retain: new PositiveInt(secondShift.retain.value - firstShiftDeleteLength.value)
            };
            continue;
        }

        // delete, delete

        const firstShiftDeleteLength = factory.getDeleteLength(firstShift.delete);
        const secondShiftDeleteLength = factory.getDeleteLength(secondShift.delete);

        if (firstShiftDeleteLength.value < secondShiftDeleteLength.value) {
            const [, newSecondShift] = splitDeleteCore(secondShift.delete, firstShiftDeleteLength);
            firstShift = undefined;
            secondShift = {
                type: delete$,
                delete: newSecondShift,
            };
            continue;
        }

        if (firstShiftDeleteLength.value === secondShiftDeleteLength.value) {
            firstShift = undefined;
            secondShift = undefined;
            continue;
        }

        // firstShiftDeleteLength.value > secondShiftDeleteLength.value
        const [, newFirstShift] = splitDeleteCore(firstShift.delete, secondShiftDeleteLength);
        firstShift = {
            type: delete$,
            delete: newFirstShift,
        };
        secondShift = undefined;
        continue;
    }
};

const invertCore = <T1, T2>(source: TextOperation<T1, T2>): TextOperation<T2, T1> => {
    return {
        headEdit: source.headEdit === undefined ? source.headEdit : invertEditElement(source.headEdit),
        body: source.body.map(body => invertTextOperationElement(body)),
        tailRetain: source.tailRetain,
    };
};

const upFactory: Factory<NonEmptyString, PositiveInt> = {
    getInsertLength: x => x.length,
    getDeleteLength: x => x,
    concatInsert: (x, y) => x.concat(y),
    concatDelete: (x, y) => PositiveInt.add(x, y),
};

const downFactory: Factory<PositiveInt, NonEmptyString> = {
    getInsertLength: x => x,
    getDeleteLength: x => x.length,
    concatInsert: (x, y) => PositiveInt.add(x, y),
    concatDelete: (x, y) => x.concat(y),
};

const twoWayFactory: Factory<NonEmptyString, NonEmptyString> = {
    getInsertLength: x => x.length,
    getDeleteLength: x => x.length,
    concatInsert: (x, y) => x.concat(y),
    concatDelete: (x, y) => x.concat(y),
};

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace TextTwoWayOperation {
    export type Operation = TextOperation<NonEmptyString, NonEmptyString>;
    export type OperationUnit = {
        type: typeof retain;
        retain: number;
    } | {
        type: typeof insert$;
        insert: string;
    } | {
        type: typeof delete$;
        delete: string;
    };

    export const diff = ({
        first,
        second,
    }: {
        first: string;
        second: string;
    }): Operation => {
        const builder = new TextOperationBuilder<NonEmptyString, NonEmptyString>(twoWayFactory);
        const dmp = new diff_match_patch();
        dmp.diff_main(first, second).forEach(([diffType, diff]) => {
            switch (diffType) {
                case -1:
                    builder.delete(new NonEmptyString(diff));
                    break;
                case 0:
                    builder.retain(new PositiveInt(diff.length));
                    break;
                case 1:
                    builder.insert(new NonEmptyString(diff));
                    break;
            }
        });
        return builder.build();
    };

    export const transform = ({ first, second }: { first: Operation; second: Operation }): CustomResult<{ firstPrime: Operation; secondPrime: Operation }, ComposeAndTransformError> => {
        return transformCore({
            first: [...new TextOperationBuilder(twoWayFactory, first).toUnits()],
            second: [...new TextOperationBuilder(twoWayFactory, second).toUnits()],
            factory: twoWayFactory,
            splitDelete: (target, deleteCount) => [
                new NonEmptyString(target.value.substring(0, deleteCount.value)),
                new NonEmptyString(target.value.substring(deleteCount.value)),
            ],
        });
    };

    export const toUnit = (source: Operation): OperationUnit[] => {
        return __(new TextOperationBuilder(twoWayFactory, source).toUnits()).map(unit => {
            switch (unit.type) {
                case insert$:
                    return {
                        type: insert$,
                        insert: unit.insert.value,
                    } as const;
                case delete$:
                    return {
                        type: delete$,
                        delete: unit.delete.value,
                    } as const;
                case retain:
                    return {
                        type: retain,
                        retain: unit.retain.value
                    } as const;
            }
        }).toArray();
    };

    export const ofUnit = (source: ReadonlyArray<OperationUnit>): Operation => {
        const builder = new TextOperationBuilder<NonEmptyString, NonEmptyString>(twoWayFactory);
        for (const unit of source) {
            if (unit == null) {
                continue;
            }
            switch (unit.type) {
                case retain: {
                    const retain = unit.retain;
                    const retainAsPositiveInt = PositiveInt.tryCreate(retain);
                    if (retainAsPositiveInt == null) {
                        continue;
                    }
                    builder.retain(retainAsPositiveInt);
                    break;
                }
                case insert$: {
                    const insert = unit.insert;
                    const insertAsNonEpmtyString = NonEmptyString.tryCreate(insert);
                    if (insertAsNonEpmtyString == null) {
                        continue;
                    }
                    builder.insert(insertAsNonEpmtyString);
                    break;
                }
                case delete$: {
                    const del = unit.delete;
                    const delAsNonEmptyString = NonEmptyString.tryCreate(del);
                    if (delAsNonEmptyString == null) {
                        continue;
                    }
                    builder.delete(delAsNonEmptyString);
                    break;
                }
            }
        }
        return builder.build();
    };

    export const toUpOperation = (source: Operation): TextOperation<NonEmptyString, PositiveInt> => {
        return mapTextOperation({
            source,
            mapInsert: insert => insert,
            mapDelete: del => del.length,
        });
    };

    export const toDownOperation = (source: Operation): TextOperation<PositiveInt, NonEmptyString> => {
        return mapTextOperation({
            source,
            mapInsert: insert => insert.length,
            mapDelete: del => del,
        });
    };
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace TextUpOperation {
    export type Operation = TextOperation<NonEmptyString, PositiveInt>;
    export type OperationUnit = {
        type: typeof retain;
        retain: number;
    } | {
        type: typeof insert$;
        insert: string;
    } | {
        type: typeof delete$;
        delete: number;
    };

    export const apply = ({
        prevState,
        action,
    }: {
        prevState: string;
        action: Operation;
    }): CustomResult<string, ApplyError<PositiveInt>> => {
        const result = applyAndRestoreCore({
            state: prevState,
            action: [...new TextOperationBuilder(upFactory, action).toIterable()],
            getDeleteLength: del => del,
            mapping: () => OptionModule.some(undefined),
        });
        if (result.isError) {
            return result;
        }
        return ResultModule.ok(result.value.newState);
    };

    export const applyAndRestore = ({
        prevState,
        action,
    }: {
        prevState: string;
        action: Operation;
    }): CustomResult<{ nextState: string; restored: TextTwoWayOperation.Operation }, ApplyError<PositiveInt>> => {
        const result = applyAndRestoreCore({
            state: prevState,
            action: [...new TextOperationBuilder(upFactory, action).toIterable()],
            getDeleteLength: del => del,
            restoreOption: {
                factory: twoWayFactory,
            },
            mapping: ({ actual }) => OptionModule.some(actual),
        });
        if (result.isError) {
            return result;
        }
        if (result.value.restored === undefined) {
            throw 'this should not happen';
        }
        return ResultModule.ok({
            nextState: result.value.newState,
            restored: result.value.restored,
        });
    };

    export const compose = ({ first, second }: { first: Operation; second: Operation }): CustomResult<Operation, ComposeAndTransformError> => {
        return composeCore({
            first: [...new TextOperationBuilder(upFactory, first).toUnits()],
            second: [...new TextOperationBuilder(upFactory, second).toUnits()],
            factory: upFactory,
            splitInsert: (str, index) => [
                new NonEmptyString(str.value.substring(0, index.value)),
                new NonEmptyString(str.value.substring(index.value)),
            ],
            splitDelete: (target, deleteCount) => [
                deleteCount,
                new PositiveInt(target.value - deleteCount.value),
            ],
        });
    };

    export const transform = ({ first, second }: { first: Operation; second: Operation }): CustomResult<{ firstPrime: Operation; secondPrime: Operation }, ComposeAndTransformError> => {
        return transformCore({
            first: [...new TextOperationBuilder(upFactory, first).toUnits()],
            second: [...new TextOperationBuilder(upFactory, second).toUnits()],
            factory: upFactory,
            splitDelete: (target, deleteCount) => [
                deleteCount,
                new PositiveInt(target.value - deleteCount.value),
            ],
        });
    };

    export const invert = (source: Operation): TextOperation<PositiveInt, NonEmptyString> => invertCore(source);

    export const toUnit = (source: Operation): OperationUnit[] => {
        return __(new TextOperationBuilder(upFactory, source).toUnits()).map(unit => {
            switch (unit.type) {
                case insert$:
                    return {
                        type: insert$,
                        insert: unit.insert.value,
                    } as const;
                case delete$:
                    return {
                        type: delete$,
                        delete: unit.delete.value,
                    } as const;
                case retain:
                    return {
                        type: retain,
                        retain: unit.retain.value
                    } as const;
            }
        }).toArray();
    };

    export const ofUnit = (source: ReadonlyArray<OperationUnit | TextTwoWayOperation.OperationUnit>): Operation => {
        const builder = new TextOperationBuilder<NonEmptyString, PositiveInt>(upFactory);
        for (const unit of source) {
            if (unit == null) {
                continue;
            }
            switch (unit.type) {
                case retain: {
                    const retain = unit.retain;
                    const retainAsPositiveInt = PositiveInt.tryCreate(retain);
                    if (retainAsPositiveInt == null) {
                        continue;
                    }
                    builder.retain(retainAsPositiveInt);
                    break;
                }
                case insert$: {
                    const insert = unit.insert;
                    const insertAsNonEmptyString = NonEmptyString.tryCreate(insert);
                    if (insertAsNonEmptyString == null) {
                        continue;
                    }
                    builder.insert(insertAsNonEmptyString);
                    break;
                }
                case delete$: {
                    const del = typeof unit.delete === 'string' ? unit.delete.length : unit.delete;
                    const delAsPositiveInt = PositiveInt.tryCreate(del);
                    if (delAsPositiveInt == null) {
                        continue;
                    }
                    builder.delete(delAsPositiveInt);
                    break;
                }
            }
        }
        return builder.build();
    };
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace TextDownOperation {
    export type Operation = TextOperation<PositiveInt, NonEmptyString>;
    export type OperationUnit = {
        type: typeof retain;
        retain: number;
    } | {
        type: typeof insert$;
        insert: number;
    } | {
        type: typeof delete$;
        delete: string;
    };

    export const applyBack = ({
        nextState,
        action,
    }: {
        nextState: string;
        action: Operation;
    }): CustomResult<string, ApplyError<PositiveInt>> => {
        return TextUpOperation.apply({ prevState: nextState, action: invertCore(action) });
    };

    export const applyBackAndRestore = ({
        nextState,
        action,
    }: {
        nextState: string;
        action: Operation;
    }): CustomResult<{ prevState: string; restored: TextTwoWayOperation.Operation }, ApplyError<PositiveInt>> => {
        const invertedResult = TextUpOperation.applyAndRestore({ prevState: nextState, action: invertCore(action) });
        if (invertedResult.isError) {
            return invertedResult;
        }
        return ResultModule.ok({
            prevState: invertedResult.value.nextState,
            restored: invertCore(invertedResult.value.restored),
        });
    };

    export const compose = ({ first, second }: { first: Operation; second: Operation }): CustomResult<Operation, ComposeAndTransformError> => {
        return composeCore({
            first: [...new TextOperationBuilder(downFactory, first).toUnits()],
            second: [...new TextOperationBuilder(downFactory, second).toUnits()],
            factory: downFactory,
            splitInsert: (target, deleteCount) => [
                deleteCount,
                new PositiveInt(target.value - deleteCount.value),
            ],
            splitDelete: (str, index) => [
                new NonEmptyString(str.value.substring(0, index.value)),
                new NonEmptyString(str.value.substring(index.value)),
            ],
        });
    };

    export const invert = (source: Operation): TextOperation<NonEmptyString, PositiveInt> => invertCore(source);

    export const toUnit = (source: Operation): OperationUnit[] => {
        return __(new TextOperationBuilder(downFactory, source).toUnits()).map(unit => {
            switch (unit.type) {
                case insert$:
                    return {
                        type: insert$,
                        insert: unit.insert.value,
                    } as const;
                case delete$:
                    return {
                        type: delete$,
                        delete: unit.delete.value,
                    } as const;
                case retain:
                    return {
                        type: retain,
                        retain: unit.retain.value
                    } as const;
            }
        }).toArray();
    };

    export const ofUnit = (source: ReadonlyArray<OperationUnit | TextTwoWayOperation.OperationUnit>): Operation => {
        const builder = new TextOperationBuilder<PositiveInt, NonEmptyString>(downFactory);
        for (const unit of source) {
            if (unit == null) {
                continue;
            }
            switch (unit.type) {
                case retain: {
                    const retain = unit.retain;
                    const retainAsPositiveInt = PositiveInt.tryCreate(retain);
                    if (retainAsPositiveInt == null) {
                        continue;
                    }
                    builder.retain(retainAsPositiveInt);
                    break;
                }
                case insert$: {
                    const insert = typeof unit.insert === 'string' ? unit.insert.length : unit.insert;
                    const insertAsPositiveInt = PositiveInt.tryCreate(insert);
                    if (insertAsPositiveInt == null) {
                        continue;
                    }
                    builder.insert(insertAsPositiveInt);
                    break;
                }
                case delete$: {
                    const del = unit.delete;
                    const delAsPositiveInt = NonEmptyString.tryCreate(del);
                    if (delAsPositiveInt == null) {
                        continue;
                    }
                    builder.delete(delAsPositiveInt);
                    break;
                }
            }
        }
        return builder.build();
    };

    export const diff = ({
        first,
        second,
    }: {
        first: string;
        second: string;
    }): Operation => {
        const builder = new TextOperationBuilder<PositiveInt, NonEmptyString>(downFactory);
        const dmp = new diff_match_patch();
        dmp.diff_main(first, second).forEach(([diffType, diff]) => {
            switch (diffType) {
                case -1:
                    builder.delete(new NonEmptyString(diff));
                    break;
                case 0:
                    builder.retain(new PositiveInt(diff.length));
                    break;
                case 1:
                    builder.insert(new PositiveInt(diff.length));
                    break;
            }
        });
        return builder.build();
    };
}