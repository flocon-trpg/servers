"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextDownOperation = exports.TextUpOperation = exports.TextTwoWayOperation = exports.stateTooLong = exports.stateTooShort = exports.deleteStringNotMatch = exports.edit = exports.retain = exports.delete$ = exports.insert$ = exports.NonEmptyString = exports.PositiveInt = void 0;
const Option_1 = require("./Option");
const Result_1 = require("./Result");
const diff_match_patch_1 = require("diff-match-patch");
const collection_1 = require("./collection");
class PositiveInt {
    constructor(source) {
        this.source = source;
        if (!Number.isInteger(source)) {
            throw 'not integer';
        }
        if (source < 1) {
            throw 'less than 1';
        }
    }
    get value() {
        return this.source;
    }
    static get one() {
        return new PositiveInt(1);
    }
    get successor() {
        return new PositiveInt(this.source + 1);
    }
    static add(x, y) {
        return new PositiveInt(x.value + y.value);
    }
    static tryCreate(source) {
        if (!Number.isInteger(source)) {
            return undefined;
        }
        if (source < 1) {
            return undefined;
        }
        return new PositiveInt(source);
    }
}
exports.PositiveInt = PositiveInt;
class NonEmptyString {
    constructor(source) {
        this.source = source;
        if (source === '') {
            throw 'empty string';
        }
    }
    get value() {
        return this.source;
    }
    get length() {
        return new PositiveInt(this.source.length);
    }
    concat(other) {
        return new NonEmptyString(this.value + other.value);
    }
    static tryCreate(source) {
        if (source === '') {
            return undefined;
        }
        return new NonEmptyString(source);
    }
}
exports.NonEmptyString = NonEmptyString;
exports.insert$ = 'insert';
exports.delete$ = 'delete';
const replace$ = 'replace';
const prevLengthOfEditElement = (source, factory) => source.delete === undefined ? 0 : factory.getDeleteLength(source.delete).value;
const nextLengthOfEditElement = (source, factory) => source.insert === undefined ? 0 : factory.getInsertLength(source.insert).value;
const mapEditElement = ({ source, mapInsert, mapDelete }) => {
    switch (source.type) {
        case exports.insert$:
            return {
                type: exports.insert$,
                insert: mapInsert(source.insert),
            };
        case exports.delete$:
            return {
                type: exports.delete$,
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
const insertToEditElement = (source, insert, concat) => {
    switch (source.type) {
        case exports.insert$:
            return {
                type: exports.insert$,
                insert: concat(source.insert, insert),
            };
        case exports.delete$:
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
const deleteToEditElement = (source, del, concat) => {
    switch (source.type) {
        case exports.insert$:
            return {
                type: replace$,
                insert: source.insert,
                delete: del,
            };
        case exports.delete$:
            return {
                type: exports.delete$,
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
const invertEditElement = (source) => {
    switch (source.type) {
        case exports.insert$:
            return {
                type: exports.delete$,
                delete: source.insert,
            };
        case exports.delete$:
            return {
                type: exports.insert$,
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
exports.retain = 'retain';
exports.edit = 'edit';
const prevLengthOfTextOperationElementArray = (source, getDeleteLength) => {
    return source.reduce((seed, elem) => {
        switch (elem.type) {
            case exports.retain:
                return seed + elem.retain.value;
            default:
                return seed + (elem.edit.delete === undefined ? 0 : getDeleteLength(elem.edit.delete).value);
        }
    }, 0);
};
const prevLengthOfTextOperationUnitArray = (source, factory) => {
    return source.reduce((seed, elem) => {
        switch (elem.type) {
            case exports.retain:
                return seed + elem.retain.value;
            default:
                return seed + prevLengthOfEditElement(elem, factory);
        }
    }, 0);
};
const nextLengthOfTextOperationUnitArray = (source, factory) => {
    return source.reduce((seed, elem) => {
        switch (elem.type) {
            case exports.retain:
                return seed + elem.retain.value;
            default:
                return seed + nextLengthOfEditElement(elem, factory);
        }
    }, 0);
};
const mapTextOperationElement = ({ source, mapInsert, mapDelete }) => {
    return Object.assign(Object.assign({}, source), { secondEdit: mapEditElement({ source: source.secondEdit, mapInsert, mapDelete }) });
};
const invertTextOperationElement = (source) => {
    return Object.assign(Object.assign({}, source), { secondEdit: invertEditElement(source.secondEdit) });
};
const mapTextOperation = ({ source, mapInsert, mapDelete }) => {
    return {
        headEdit: source.headEdit === undefined ? source.headEdit : mapEditElement({ source: source.headEdit, mapInsert, mapDelete }),
        body: source.body.map(body => mapTextOperationElement({ source: body, mapInsert, mapDelete })),
        tailRetain: source.tailRetain,
    };
};
class TextOperationBuilder {
    constructor(factory, source) {
        var _a, _b;
        this.factory = factory;
        this.headEdit = null;
        this.body = [];
        this.tailRetain = 0;
        if (source == null) {
            return;
        }
        this.headEdit = (_a = source.headEdit) !== null && _a !== void 0 ? _a : null;
        this.body = [...source.body];
        this.tailRetain = (_b = source.tailRetain) !== null && _b !== void 0 ? _b : 0;
    }
    retain(count) {
        if (this.tailRetain === 0) {
            this.tailRetain = count;
            return;
        }
        this.tailRetain = PositiveInt.add(this.tailRetain, count);
    }
    insert(insert) {
        if (this.tailRetain !== 0) {
            this.body.push({
                firstRetain: this.tailRetain,
                secondEdit: {
                    type: exports.insert$,
                    insert,
                }
            });
            this.tailRetain = 0;
            return;
        }
        if (this.body.length !== 0) {
            const last = this.body[this.body.length - 1];
            this.body[this.body.length - 1] = Object.assign(Object.assign({}, last), { secondEdit: insertToEditElement(last.secondEdit, insert, this.factory.concatInsert) });
            return;
        }
        if (this.headEdit == null) {
            this.headEdit = {
                type: exports.insert$,
                insert,
                delete: undefined,
            };
            return;
        }
        this.headEdit = insertToEditElement(this.headEdit, insert, this.factory.concatInsert);
    }
    delete(del) {
        if (this.tailRetain !== 0) {
            this.body.push({
                firstRetain: this.tailRetain,
                secondEdit: {
                    type: exports.delete$,
                    delete: del,
                }
            });
            this.tailRetain = 0;
            return;
        }
        if (this.body.length !== 0) {
            const last = this.body[this.body.length - 1];
            this.body[this.body.length - 1] = Object.assign(Object.assign({}, last), { secondEdit: deleteToEditElement(last.secondEdit, del, this.factory.concatDelete) });
            return;
        }
        if (this.headEdit == null) {
            this.headEdit = {
                type: exports.delete$,
                insert: undefined,
                delete: del,
            };
            return;
        }
        this.headEdit = deleteToEditElement(this.headEdit, del, this.factory.concatDelete);
    }
    edit(edit) {
        if (edit.delete !== undefined) {
            this.delete(edit.delete);
        }
        if (edit.insert !== undefined) {
            this.insert(edit.insert);
        }
    }
    onArrayElement(arrayElement) {
        switch (arrayElement.type) {
            case exports.retain:
                this.retain(arrayElement.retain);
                return;
            case exports.edit:
                this.edit(arrayElement.edit);
        }
    }
    onUnit(unit) {
        if (unit.type === exports.retain) {
            this.retain(unit.retain);
            return;
        }
        this.edit(unit);
    }
    build() {
        var _a;
        return {
            headEdit: (_a = this.headEdit) !== null && _a !== void 0 ? _a : undefined,
            body: [...this.body],
            tailRetain: this.tailRetain === 0 ? undefined : this.tailRetain,
        };
    }
    *toIterable() {
        const operation = this.build();
        if (operation.headEdit != null) {
            yield { type: exports.edit, edit: operation.headEdit };
        }
        for (const body of operation.body) {
            yield { type: exports.retain, retain: body.firstRetain };
            yield { type: exports.edit, edit: body.secondEdit };
        }
        if (operation.tailRetain != null) {
            yield { type: exports.retain, retain: operation.tailRetain };
        }
    }
    *toUnits() {
        for (const elem of this.toIterable()) {
            if (elem.type === exports.retain) {
                yield { type: exports.retain, retain: elem.retain };
                continue;
            }
            if (elem.edit.delete !== undefined) {
                yield { type: exports.delete$, delete: elem.edit.delete };
            }
            if (elem.edit.insert !== undefined) {
                yield { type: exports.insert$, insert: elem.edit.insert };
            }
        }
    }
}
const replace = ({ source, start, count, replacement }) => {
    if (source.length < start + count) {
        return null;
    }
    const deleted = source.substring(start, start + count);
    return { newValue: source.substring(0, start) + replacement + source.substring(start + count), deleted };
};
exports.deleteStringNotMatch = 'deleteStringNotMatch';
exports.stateTooShort = 'stateTooShort';
exports.stateTooLong = 'stateTooLong';
const applyAndRestoreCore = ({ state, action, getDeleteLength, restoreOption, mapping, }) => {
    var _a, _b;
    const prevLength = prevLengthOfTextOperationElementArray(action, getDeleteLength);
    if (state.length < prevLength) {
        return Result_1.ResultModule.error({ type: exports.stateTooShort });
    }
    if (state.length > prevLength) {
        return Result_1.ResultModule.error({ type: exports.stateTooLong });
    }
    let result = state;
    let cursor = 0;
    const builder = restoreOption == null ? undefined : new TextOperationBuilder(restoreOption.factory);
    for (const act of action) {
        switch (act.type) {
            case exports.retain: {
                cursor += act.retain.value;
                builder === null || builder === void 0 ? void 0 : builder.retain(act.retain);
                break;
            }
            case exports.edit: {
                const replacement = (_b = (_a = act.edit.insert) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : '';
                const replaceResult = replace({
                    source: result,
                    start: cursor,
                    count: act.edit.delete == null ? 0 : getDeleteLength(act.edit.delete).value,
                    replacement,
                });
                if (replaceResult == null) {
                    return Result_1.ResultModule.error({
                        type: exports.stateTooShort,
                    });
                }
                if (act.edit.delete != null) {
                    const deleted = new NonEmptyString(replaceResult.deleted);
                    const mapped = mapping({ expected: act.edit.delete, actual: deleted });
                    if (!mapped.hasValue) {
                        return Result_1.ResultModule.error({
                            type: exports.deleteStringNotMatch,
                            startCharIndex: cursor,
                            expected: act.edit.delete,
                            actual: deleted,
                        });
                    }
                    builder === null || builder === void 0 ? void 0 : builder.delete(mapped.value);
                }
                if (act.edit.insert !== undefined) {
                    builder === null || builder === void 0 ? void 0 : builder.insert(act.edit.insert);
                }
                result = replaceResult.newValue;
                cursor += replacement.length;
            }
        }
    }
    return Result_1.ResultModule.ok({ newState: result, restored: builder === null || builder === void 0 ? void 0 : builder.build() });
};
const secondTooShort = 'secondTooShort';
const secondTooLong = 'secondTooLong';
const composeCore = ({ first: $first, second: $second, factory, splitDelete: splitDeleteCore, splitInsert: splitInsertCore, }) => {
    const nextLengthOfFirst = nextLengthOfTextOperationUnitArray($first, factory);
    const prevLengthOfSecond = prevLengthOfTextOperationUnitArray($second, factory);
    if (nextLengthOfFirst < prevLengthOfSecond) {
        return Result_1.ResultModule.error({ type: secondTooLong });
    }
    if (nextLengthOfFirst > prevLengthOfSecond) {
        return Result_1.ResultModule.error({ type: secondTooShort });
    }
    const first = [...$first];
    const second = [...$second];
    let firstShift = undefined;
    let secondShift = undefined;
    const builder = new TextOperationBuilder(factory);
    while (true) {
        if (firstShift === undefined) {
            firstShift = first.shift();
        }
        if (secondShift === undefined) {
            secondShift = second.shift();
        }
        if (firstShift === undefined) {
            if (secondShift === undefined) {
                return Result_1.ResultModule.ok(builder.build());
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
        if (firstShift.type === exports.delete$) {
            builder.delete(firstShift.delete);
            firstShift = undefined;
            continue;
        }
        if (secondShift.type === exports.insert$) {
            builder.insert(secondShift.insert);
            secondShift = undefined;
            continue;
        }
        if (firstShift.type === exports.retain) {
            if (secondShift.type === exports.retain) {
                if (firstShift.retain.value < secondShift.retain.value) {
                    builder.retain(firstShift.retain);
                    secondShift = {
                        type: exports.retain,
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
                    type: exports.retain,
                    retain: new PositiveInt(firstShift.retain.value - secondShift.retain.value),
                };
                secondShift = undefined;
                continue;
            }
            if (secondShift.type === exports.delete$) {
                const secondShiftDeleteLength = factory.getDeleteLength(secondShift.delete);
                if (firstShift.retain.value < secondShiftDeleteLength.value) {
                    const [intersection, remaining] = splitDeleteCore(secondShift.delete, firstShift.retain);
                    builder.delete(intersection);
                    secondShift = {
                        type: exports.delete$,
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
                    type: exports.retain,
                    retain: new PositiveInt(firstShift.retain.value - secondShiftDeleteLength.value),
                };
                secondShift = undefined;
                continue;
            }
            throw 'This should not happen.';
        }
        if (secondShift.type === exports.retain) {
            const firstShiftInsertLength = factory.getInsertLength(firstShift.insert);
            if (firstShiftInsertLength.value < secondShift.retain.value) {
                builder.insert(firstShift.insert);
                secondShift = {
                    type: exports.retain,
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
                type: exports.insert$,
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
                type: exports.delete$,
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
            type: exports.insert$,
            insert: remaining,
        };
        secondShift = undefined;
        continue;
    }
};
const transformCore = ({ first: $first, second: $second, factory, splitDelete: splitDeleteCore, }) => {
    const prevLengthOfFirst = prevLengthOfTextOperationUnitArray($first, factory);
    const prevLengthOfSecond = prevLengthOfTextOperationUnitArray($second, factory);
    if (prevLengthOfFirst < prevLengthOfSecond) {
        return Result_1.ResultModule.error({ type: secondTooLong });
    }
    if (prevLengthOfFirst > prevLengthOfSecond) {
        return Result_1.ResultModule.error({ type: secondTooShort });
    }
    const first = [...$first];
    const second = [...$second];
    let firstShift = undefined;
    let secondShift = undefined;
    const firstPrime = new TextOperationBuilder(factory);
    const secondPrime = new TextOperationBuilder(factory);
    while (true) {
        if (firstShift === undefined) {
            firstShift = first.shift();
        }
        if (secondShift === undefined) {
            secondShift = second.shift();
        }
        if (firstShift === undefined) {
            if (secondShift === undefined) {
                return Result_1.ResultModule.ok({ firstPrime: firstPrime.build(), secondPrime: secondPrime.build() });
            }
            if (secondShift.type === exports.insert$) {
                firstPrime.retain(factory.getInsertLength(secondShift.insert));
            }
            secondPrime.onUnit(secondShift);
            secondShift = undefined;
            continue;
        }
        if (secondShift === undefined) {
            firstPrime.onUnit(firstShift);
            if (firstShift.type === exports.insert$) {
                secondPrime.retain(factory.getInsertLength(firstShift.insert));
            }
            firstShift = undefined;
            continue;
        }
        if (firstShift.type === exports.insert$) {
            firstPrime.insert(firstShift.insert);
            secondPrime.retain(factory.getInsertLength(firstShift.insert));
            firstShift = undefined;
            continue;
        }
        if (secondShift.type === exports.insert$) {
            firstPrime.retain(factory.getInsertLength(secondShift.insert));
            secondPrime.insert(secondShift.insert);
            secondShift = undefined;
            continue;
        }
        if (firstShift.type === exports.retain) {
            if (secondShift.type === exports.retain) {
                if (firstShift.retain.value < secondShift.retain.value) {
                    firstPrime.retain(firstShift.retain);
                    secondPrime.retain(firstShift.retain);
                    secondShift = { type: exports.retain, retain: new PositiveInt(secondShift.retain.value - firstShift.retain.value) };
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
                firstShift = { type: exports.retain, retain: new PositiveInt(firstShift.retain.value - secondShift.retain.value) };
                secondShift = undefined;
                continue;
            }
            const secondShiftDeleteLength = factory.getDeleteLength(secondShift.delete);
            if (firstShift.retain.value < secondShiftDeleteLength.value) {
                const [intersection, newSecondShift] = splitDeleteCore(secondShift.delete, firstShift.retain);
                secondPrime.delete(intersection);
                firstShift = undefined;
                secondShift = {
                    type: exports.delete$,
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
            secondPrime.delete(secondShift.delete);
            firstShift = {
                type: exports.retain,
                retain: new PositiveInt(firstShift.retain.value - secondShiftDeleteLength.value)
            };
            secondShift = undefined;
            continue;
        }
        if (secondShift.type === exports.retain) {
            const firstShiftDeleteLength = factory.getDeleteLength(firstShift.delete);
            if (secondShift.retain.value < firstShiftDeleteLength.value) {
                const [intersection, newFirstShift] = splitDeleteCore(firstShift.delete, secondShift.retain);
                firstPrime.delete(intersection);
                firstShift = {
                    type: exports.delete$,
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
            firstPrime.delete(firstShift.delete);
            firstShift = undefined;
            secondShift = {
                type: exports.retain,
                retain: new PositiveInt(secondShift.retain.value - firstShiftDeleteLength.value)
            };
            continue;
        }
        const firstShiftDeleteLength = factory.getDeleteLength(firstShift.delete);
        const secondShiftDeleteLength = factory.getDeleteLength(secondShift.delete);
        if (firstShiftDeleteLength.value < secondShiftDeleteLength.value) {
            const [, newSecondShift] = splitDeleteCore(secondShift.delete, firstShiftDeleteLength);
            firstShift = undefined;
            secondShift = {
                type: exports.delete$,
                delete: newSecondShift,
            };
            continue;
        }
        if (firstShiftDeleteLength.value === secondShiftDeleteLength.value) {
            firstShift = undefined;
            secondShift = undefined;
            continue;
        }
        const [, newFirstShift] = splitDeleteCore(firstShift.delete, secondShiftDeleteLength);
        firstShift = {
            type: exports.delete$,
            delete: newFirstShift,
        };
        secondShift = undefined;
        continue;
    }
};
const invertCore = (source) => {
    return {
        headEdit: source.headEdit === undefined ? source.headEdit : invertEditElement(source.headEdit),
        body: source.body.map(body => invertTextOperationElement(body)),
        tailRetain: source.tailRetain,
    };
};
const upFactory = {
    getInsertLength: x => x.length,
    getDeleteLength: x => x,
    concatInsert: (x, y) => x.concat(y),
    concatDelete: (x, y) => PositiveInt.add(x, y),
};
const downFactory = {
    getInsertLength: x => x,
    getDeleteLength: x => x.length,
    concatInsert: (x, y) => PositiveInt.add(x, y),
    concatDelete: (x, y) => x.concat(y),
};
const twoWayFactory = {
    getInsertLength: x => x.length,
    getDeleteLength: x => x.length,
    concatInsert: (x, y) => x.concat(y),
    concatDelete: (x, y) => x.concat(y),
};
var TextTwoWayOperation;
(function (TextTwoWayOperation) {
    TextTwoWayOperation.diff = ({ first, second, }) => {
        const builder = new TextOperationBuilder(twoWayFactory);
        const dmp = new diff_match_patch_1.diff_match_patch();
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
    TextTwoWayOperation.transform = ({ first, second }) => {
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
    TextTwoWayOperation.toUnit = (source) => {
        return collection_1.__(new TextOperationBuilder(twoWayFactory, source).toUnits()).map(unit => {
            switch (unit.type) {
                case exports.insert$:
                    return {
                        type: exports.insert$,
                        insert: unit.insert.value,
                    };
                case exports.delete$:
                    return {
                        type: exports.delete$,
                        delete: unit.delete.value,
                    };
                case exports.retain:
                    return {
                        type: exports.retain,
                        retain: unit.retain.value
                    };
            }
        }).toArray();
    };
    TextTwoWayOperation.toUpOperation = (source) => {
        return mapTextOperation({
            source,
            mapInsert: insert => insert,
            mapDelete: del => del.length,
        });
    };
    TextTwoWayOperation.toDownOperation = (source) => {
        return mapTextOperation({
            source,
            mapInsert: insert => insert.length,
            mapDelete: del => del,
        });
    };
})(TextTwoWayOperation = exports.TextTwoWayOperation || (exports.TextTwoWayOperation = {}));
var TextUpOperation;
(function (TextUpOperation) {
    TextUpOperation.apply = ({ prevState, action, }) => {
        const result = applyAndRestoreCore({
            state: prevState,
            action: [...new TextOperationBuilder(upFactory, action).toIterable()],
            getDeleteLength: del => del,
            mapping: () => Option_1.OptionModule.some(undefined),
        });
        if (result.isError) {
            return result;
        }
        return Result_1.ResultModule.ok(result.value.newState);
    };
    TextUpOperation.applyAndRestore = ({ prevState, action, }) => {
        const result = applyAndRestoreCore({
            state: prevState,
            action: [...new TextOperationBuilder(upFactory, action).toIterable()],
            getDeleteLength: del => del,
            restoreOption: {
                factory: twoWayFactory,
            },
            mapping: ({ actual }) => Option_1.OptionModule.some(actual),
        });
        if (result.isError) {
            return result;
        }
        if (result.value.restored === undefined) {
            throw 'this should not happen';
        }
        return Result_1.ResultModule.ok({
            nextState: result.value.newState,
            restored: result.value.restored,
        });
    };
    TextUpOperation.compose = ({ first, second }) => {
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
    TextUpOperation.transform = ({ first, second }) => {
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
    TextUpOperation.invert = (source) => invertCore(source);
    TextUpOperation.toUnit = (source) => {
        return collection_1.__(new TextOperationBuilder(upFactory, source).toUnits()).map(unit => {
            switch (unit.type) {
                case exports.insert$:
                    return {
                        type: exports.insert$,
                        insert: unit.insert.value,
                    };
                case exports.delete$:
                    return {
                        type: exports.delete$,
                        delete: unit.delete.value,
                    };
                case exports.retain:
                    return {
                        type: exports.retain,
                        retain: unit.retain.value
                    };
            }
        }).toArray();
    };
    TextUpOperation.ofUnit = (source) => {
        if (source == null) {
            return undefined;
        }
        if (!Array.isArray(source)) {
            return undefined;
        }
        const builder = new TextOperationBuilder(upFactory);
        for (const unit of source) {
            if (unit == null) {
                continue;
            }
            if (typeof unit !== 'object') {
                return undefined;
            }
            if (typeof unit.type !== 'string') {
                return undefined;
            }
            switch (unit.type) {
                case exports.retain: {
                    const retain = unit.retain;
                    if (typeof retain !== 'number') {
                        return undefined;
                    }
                    const retainAsPositiveInt = PositiveInt.tryCreate(retain);
                    if (retainAsPositiveInt == null) {
                        return undefined;
                    }
                    builder.retain(retainAsPositiveInt);
                    break;
                }
                case exports.insert$: {
                    const insert = unit.insert;
                    if (typeof insert !== 'string') {
                        return undefined;
                    }
                    const insertAsPositiveInt = NonEmptyString.tryCreate(insert);
                    if (insertAsPositiveInt == null) {
                        return undefined;
                    }
                    builder.insert(insertAsPositiveInt);
                    break;
                }
                case exports.delete$: {
                    const del = unit.delete;
                    if (typeof del !== 'number') {
                        return undefined;
                    }
                    const delAsPositiveInt = PositiveInt.tryCreate(del);
                    if (delAsPositiveInt == null) {
                        return undefined;
                    }
                    builder.delete(delAsPositiveInt);
                    break;
                }
                default: {
                    return undefined;
                }
            }
        }
        return builder.build();
    };
})(TextUpOperation = exports.TextUpOperation || (exports.TextUpOperation = {}));
var TextDownOperation;
(function (TextDownOperation) {
    TextDownOperation.applyBack = ({ nextState, action, }) => {
        return TextUpOperation.apply({ prevState: nextState, action: invertCore(action) });
    };
    TextDownOperation.applyBackAndRestore = ({ nextState, action, }) => {
        const invertedResult = TextUpOperation.applyAndRestore({ prevState: nextState, action: invertCore(action) });
        if (invertedResult.isError) {
            return invertedResult;
        }
        return Result_1.ResultModule.ok({
            prevState: invertedResult.value.nextState,
            restored: invertCore(invertedResult.value.restored),
        });
    };
    TextDownOperation.compose = ({ first, second }) => {
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
    TextDownOperation.invert = (source) => invertCore(source);
    TextDownOperation.toUnit = (source) => {
        return collection_1.__(new TextOperationBuilder(downFactory, source).toUnits()).map(unit => {
            switch (unit.type) {
                case exports.insert$:
                    return {
                        type: exports.insert$,
                        insert: unit.insert.value,
                    };
                case exports.delete$:
                    return {
                        type: exports.delete$,
                        delete: unit.delete.value,
                    };
                case exports.retain:
                    return {
                        type: exports.retain,
                        retain: unit.retain.value
                    };
            }
        }).toArray();
    };
    TextDownOperation.ofUnit = (source) => {
        if (source == null) {
            return undefined;
        }
        if (!Array.isArray(source)) {
            return undefined;
        }
        const builder = new TextOperationBuilder(downFactory);
        for (const unit of source) {
            if (unit == null) {
                continue;
            }
            if (typeof unit !== 'object') {
                return undefined;
            }
            if (typeof unit.type !== 'string') {
                return undefined;
            }
            switch (unit.type) {
                case exports.retain: {
                    const retain = unit.retain;
                    if (typeof retain !== 'number') {
                        return undefined;
                    }
                    const retainAsPositiveInt = PositiveInt.tryCreate(retain);
                    if (retainAsPositiveInt == null) {
                        return undefined;
                    }
                    builder.retain(retainAsPositiveInt);
                    break;
                }
                case exports.insert$: {
                    const insert = unit.insert;
                    if (typeof insert !== 'number') {
                        return undefined;
                    }
                    const insertAsPositiveInt = PositiveInt.tryCreate(insert);
                    if (insertAsPositiveInt == null) {
                        return undefined;
                    }
                    builder.insert(insertAsPositiveInt);
                    break;
                }
                case exports.delete$: {
                    const del = unit.delete;
                    if (typeof del !== 'string') {
                        return undefined;
                    }
                    const delAsPositiveInt = NonEmptyString.tryCreate(del);
                    if (delAsPositiveInt == null) {
                        return undefined;
                    }
                    builder.delete(delAsPositiveInt);
                    break;
                }
                default: {
                    return undefined;
                }
            }
        }
        return builder.build();
    };
    TextDownOperation.diff = ({ first, second, }) => {
        const builder = new TextOperationBuilder(downFactory);
        const dmp = new diff_match_patch_1.diff_match_patch();
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
})(TextDownOperation = exports.TextDownOperation || (exports.TextDownOperation = {}));
