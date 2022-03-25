import {
    createReplaceValueTemplate as rep,
    createObjectValueTemplate as obj,
    otValueTemplate as otString,
    createRecordValueTemplate as rec,
    State as StateType,
    UpOperation as UpOperationType,
    DownOperation as DownOperationType,
    TwoWayOperation as TwoWayOperationType,
    toUpOperation,
    toDownOperation,
    apply,
    applyBack,
    composeDownOperation,
    restore,
    diff,
    clientTransform,
} from '../src/internal/ot/generator';
import * as t from 'io-ts';
import { replace, update } from '../src/internal/ot/util/recordOperationElement';
import * as TextOperation from '../src/internal/ot/util/textOperation';
import { Result } from '@kizahasi/result';

namespace ReplaceValue {
    export const template = rep(t.union([t.number, t.undefined]));
    export type UpOperation = UpOperationType<typeof template>;
    export type DownOperation = DownOperationType<typeof template>;
    export type TwoWayOperation = TwoWayOperationType<typeof template>;
}

namespace OtString {
    export const template = otString;
    export type UpOperation = UpOperationType<typeof template>;
    export type DownOperation = DownOperationType<typeof template>;
    export type TwoWayOperation = TwoWayOperationType<typeof template>;
}

namespace ObjectValue {
    export const template = obj({
        value1: ReplaceValue.template,
        value2: ReplaceValue.template,
        value3: ReplaceValue.template,
        value4: ReplaceValue.template,
    });
    export type State = StateType<typeof template>;
    export type UpOperation = UpOperationType<typeof template>;
    export type DownOperation = DownOperationType<typeof template>;
    export type TwoWayOperation = TwoWayOperationType<typeof template>;
}

namespace RecordValue {
    export const template = rec(
        obj({
            value: ReplaceValue.template,
        })
    );
    export type State = StateType<typeof template>;
    export type DownOperation = DownOperationType<typeof template>;
    export type UpOperation = UpOperationType<typeof template>;
    export type TwoWayOperation = TwoWayOperationType<typeof template>;
}

describe('toUpOperation', () => {
    it.each([
        [1, 2],
        [undefined, 2],
        [1, undefined],
    ] as const)('tests ReplaceValueTemplate', (oldValue, newValue) => {
        const source: ReplaceValue.TwoWayOperation = {
            oldValue,
            newValue,
        };
        expect(toUpOperation(ReplaceValue.template)(source)).toEqual({
            newValue,
        });
    });

    it('tests OtStringTemplate', () => {
        const source: OtString.TwoWayOperation = TextOperation.diff({
            prev: 'text1',
            next: 'text2',
        })!;
        expect(toUpOperation(OtString.template)(source)).toEqual(
            TextOperation.toUpOperation(source)
        );
    });

    it('tests ObjectTemplate', () => {
        const source: ObjectValue.TwoWayOperation = {
            value1: {
                oldValue: 11,
                newValue: 12,
            },
            value2: {
                oldValue: 21,
                newValue: 22,
            },
        };

        expect(toUpOperation(ObjectValue.template)(source)).toEqual({
            value1: {
                newValue: 12,
            },
            value2: {
                newValue: 22,
            },
        });
    });

    it('tests RecordTemplate', () => {
        const source: RecordValue.TwoWayOperation = {
            key1: {
                type: update,
                update: {
                    value: {
                        oldValue: 11,
                        newValue: 12,
                    },
                },
            },
            key2: {
                type: replace,
                replace: {
                    oldValue: { value: 21 },
                    newValue: undefined,
                },
            },
            key3: {
                type: replace,
                replace: {
                    oldValue: undefined,
                    newValue: { value: 32 },
                },
            },
            key4: undefined,
        };

        expect(toUpOperation(RecordValue.template)(source)).toEqual({
            key1: {
                type: update,
                update: {
                    value: {
                        newValue: 12,
                    },
                },
            },
            key2: {
                type: replace,
                replace: {
                    newValue: undefined,
                },
            },
            key3: {
                type: replace,
                replace: {
                    newValue: { value: 32 },
                },
            },
            key4: undefined,
        });
    });
});

describe('toDownOperation', () => {
    it.each([
        [1, 2],
        [undefined, 2],
        [1, undefined],
    ] as const)('tests ReplaceValueTemplate', (oldValue, newValue) => {
        const source: ReplaceValue.TwoWayOperation = {
            oldValue,
            newValue,
        };
        expect(toDownOperation(ReplaceValue.template)(source)).toEqual({
            oldValue,
        });
    });

    it('tests OtStringTemplate', () => {
        const source: OtString.TwoWayOperation = TextOperation.diff({
            prev: 'text1',
            next: 'text2',
        })!;
        expect(toDownOperation(OtString.template)(source)).toEqual(
            TextOperation.toDownOperation(source)
        );
    });

    it('tests ObjectTemplate', () => {
        const source: ObjectValue.TwoWayOperation = {
            value1: {
                oldValue: 11,
                newValue: 12,
            },
            value2: {
                oldValue: 21,
                newValue: 22,
            },
        };

        expect(toDownOperation(ObjectValue.template)(source)).toEqual({
            value1: {
                oldValue: 11,
            },
            value2: {
                oldValue: 21,
            },
        });
    });

    it('tests RecordTemplate', () => {
        const source: RecordValue.TwoWayOperation = {
            key1: {
                type: update,
                update: {
                    value: {
                        oldValue: 11,
                        newValue: 12,
                    },
                },
            },
            key2: {
                type: replace,
                replace: {
                    oldValue: { value: 21 },
                    newValue: undefined,
                },
            },
            key3: {
                type: replace,
                replace: {
                    oldValue: undefined,
                    newValue: { value: 32 },
                },
            },
            key4: undefined,
        };

        expect(toDownOperation(RecordValue.template)(source)).toEqual({
            key1: {
                type: update,
                update: {
                    value: {
                        oldValue: 11,
                    },
                },
            },
            key2: {
                type: replace,
                replace: {
                    oldValue: { value: 21 },
                },
            },
            key3: {
                type: replace,
                replace: {
                    oldValue: undefined,
                },
            },
            key4: undefined,
        });
    });
});

describe('apply', () => {
    it.each([
        [1, 2],
        [undefined, 2],
        [1, undefined],
    ] as const)('tests ReplaceValueTemplate', (oldValue, newValue) => {
        const state = oldValue;
        const operation: ReplaceValue.UpOperation = {
            newValue,
        };
        expect(apply(ReplaceValue.template)({ state, operation })).toEqual(Result.ok(newValue));
    });

    it('tests OtStringTemplate', () => {
        const prev = 'text1';
        const next = 'text2';
        const operation: OtString.TwoWayOperation = TextOperation.diff({
            prev,
            next,
        })!;
        expect(
            apply(OtString.template)({
                state: prev,
                operation: TextOperation.toUpOperation(operation),
            })
        ).toEqual(Result.ok(next));
    });

    it('tests ObjectTemplate', () => {
        const state: ObjectValue.State = {
            value1: 11,
            value2: undefined,
            value3: 31,
            value4: 41,
        };
        const operation: ObjectValue.UpOperation = {
            value1: {
                newValue: 12,
            },
            value2: {
                newValue: 22,
            },
            value3: {
                newValue: undefined,
            },
        };

        expect(apply(ObjectValue.template)({ state, operation })).toEqual(
            Result.ok({
                value1: 12,
                value2: 22,
                value4: 41,
            })
        );
    });

    it('tests RecordTemplate', () => {
        const state: RecordValue.State = {
            key1: { value: 11 },
            key2: { value: 21 },
            undefinedKey: undefined,
        };
        const operation: RecordValue.UpOperation = {
            key1: {
                type: update,
                update: {
                    value: {
                        newValue: 12,
                    },
                },
            },
            key2: {
                type: replace,
                replace: {
                    newValue: undefined,
                },
            },
            key3: {
                type: replace,
                replace: {
                    newValue: { value: 32 },
                },
            },
            key4: undefined,
        };

        expect(apply(RecordValue.template)({ state, operation })).toEqual(
            Result.ok({
                key1: { value: 12 },
                key3: { value: 32 },
            })
        );
    });
});

describe('applyBack', () => {
    it.each([
        [1, 2],
        [undefined, 2],
        [1, undefined],
    ] as const)('tests ReplaceValueTemplate', (oldValue, newValue) => {
        const state = newValue;
        const operation: ReplaceValue.DownOperation = {
            oldValue,
        };
        expect(applyBack(ReplaceValue.template)({ state, operation })).toEqual(Result.ok(oldValue));
    });

    it('tests OtStringTemplate', () => {
        const prev = 'text1';
        const next = 'text2';
        const operation: OtString.TwoWayOperation = TextOperation.diff({
            prev,
            next,
        })!;
        expect(
            applyBack(OtString.template)({
                state: next,
                operation: TextOperation.toDownOperation(operation),
            })
        ).toEqual(Result.ok(prev));
    });

    it('tests ObjectTemplate', () => {
        const state: ObjectValue.State = {
            value1: 12,
            value2: 22,
            value3: undefined,
            value4: 42,
        };
        const operation: ObjectValue.DownOperation = {
            value1: {
                oldValue: 11,
            },
            value2: {
                oldValue: undefined,
            },
            value3: {
                oldValue: 31,
            },
        };

        expect(applyBack(ObjectValue.template)({ state, operation })).toEqual(
            Result.ok({
                value1: 11,
                value3: 31,
                value4: 42,
            })
        );
    });

    it('tests RecordTemplate', () => {
        const state: RecordValue.State = {
            key1: { value: 12 },
            key3: { value: 32 },
            undefinedKey: undefined,
        };
        const operation: RecordValue.DownOperation = {
            key1: {
                type: update,
                update: {
                    value: {
                        oldValue: 11,
                    },
                },
            },
            key2: {
                type: replace,
                replace: {
                    oldValue: { value: 21 },
                },
            },
            key3: {
                type: replace,
                replace: {
                    oldValue: undefined,
                },
            },
            key4: undefined,
        };

        expect(applyBack(RecordValue.template)({ state, operation })).toEqual(
            Result.ok({
                key1: { value: 11 },
                key2: { value: 21 },
            })
        );
    });
});

describe('composeDownOperation', () => {
    it.each([
        [1, 2],
        [1, undefined],
        [undefined, 2],
    ] as const)('tests ReplaceValueTemplate', (state1, state2) => {
        const first: ReplaceValue.DownOperation = {
            oldValue: state1,
        };
        const second: ReplaceValue.DownOperation = {
            oldValue: state2,
        };
        expect(composeDownOperation(ReplaceValue.template)({ first, second })).toEqual(
            Result.ok({
                oldValue: state1,
            })
        );
    });

    it('tests OtStringTemplate', () => {
        const state1 = 'text1';
        const state2 = 'text2';
        const state3 = 'text3';
        const first: OtString.DownOperation = TextOperation.toDownOperation(
            TextOperation.diff({
                prev: state1,
                next: state2,
            })!
        );
        const second: OtString.DownOperation = TextOperation.toDownOperation(
            TextOperation.diff({
                prev: state2,
                next: state3,
            })!
        );
        const expected: OtString.DownOperation = TextOperation.toDownOperation(
            TextOperation.diff({
                prev: state1,
                next: state3,
            })!
        );
        expect(
            composeDownOperation(OtString.template)({
                first,
                second,
            })
        ).toEqual(Result.ok(expected));
    });

    it('tests ObjectTemplate', () => {
        const first: ObjectValue.DownOperation = {
            value1: {
                oldValue: 11,
            },
            value2: {
                oldValue: undefined,
            },
            value3: {
                oldValue: 31,
            },
            value4: undefined,
        };
        const second: ObjectValue.DownOperation = {
            value1: {
                oldValue: 12,
            },
            value2: {
                oldValue: 21,
            },
            value3: {
                oldValue: undefined,
            },
            value4: undefined,
        };

        expect(composeDownOperation(ObjectValue.template)({ first, second })).toEqual(
            Result.ok(first)
        );
    });

    it('tests RecordTemplate', () => {
        const first: RecordValue.DownOperation = {
            idUpdate: undefined,
            updateId: {
                type: update,
                update: {
                    value: {
                        oldValue: 1,
                    },
                },
            },
            idReplace: undefined,
            replaceId: {
                type: replace,
                replace: {
                    oldValue: {
                        value: 1,
                    },
                },
            },
            updateUpdate: {
                type: update,
                update: {
                    value: {
                        oldValue: 1,
                    },
                },
            },
            updateReplace: {
                type: update,
                update: {
                    value: {
                        oldValue: 1,
                    },
                },
            },
            replaceUpdate: {
                type: replace,
                replace: {
                    oldValue: {
                        value: 1,
                    },
                },
            },
        };
        const second: RecordValue.DownOperation = {
            idUpdate: {
                type: update,
                update: {
                    value: {
                        oldValue: 2,
                    },
                },
            },
            updateId: undefined,
            idReplace: {
                type: replace,
                replace: {
                    oldValue: {
                        value: 2,
                    },
                },
            },
            replaceId: undefined,
            updateUpdate: {
                type: update,
                update: {
                    value: {
                        oldValue: 2,
                    },
                },
            },
            updateReplace: {
                type: replace,
                replace: {
                    oldValue: { value: 2 },
                },
            },
            replaceUpdate: {
                type: update,
                update: {
                    value: {
                        oldValue: 2,
                    },
                },
            },
        };
        const expected: RecordValue.DownOperation = {
            idUpdate: {
                type: update,
                update: {
                    value: {
                        oldValue: 2,
                    },
                },
            },
            updateId: {
                type: update,
                update: {
                    value: {
                        oldValue: 1,
                    },
                },
            },
            idReplace: {
                type: replace,
                replace: {
                    oldValue: {
                        value: 2,
                    },
                },
            },
            replaceId: {
                type: replace,
                replace: {
                    oldValue: {
                        value: 1,
                    },
                },
            },
            updateUpdate: {
                type: update,
                update: {
                    value: {
                        oldValue: 1,
                    },
                },
            },
            updateReplace: {
                type: replace,
                replace: {
                    oldValue: {
                        value: 1,
                    },
                },
            },
            replaceUpdate: {
                type: replace,
                replace: {
                    oldValue: {
                        value: 1,
                    },
                },
            },
        };

        expect(composeDownOperation(RecordValue.template)({ first, second })).toEqual(
            Result.ok(expected)
        );
    });
});

describe('restore', () => {
    it.each([
        [1, 2],
        [undefined, 2],
        [1, undefined],
    ] as const)('tests ReplaceValueTemplate', (oldValue, newValue) => {
        const nextState = newValue;
        const downOperation: ReplaceValue.DownOperation = {
            oldValue,
        };
        expect(restore(ReplaceValue.template)({ nextState, downOperation })).toEqual(
            Result.ok({
                prevState: oldValue,
                twoWayOperation: {
                    oldValue,
                    newValue,
                },
            })
        );
    });

    it('tests OtStringTemplate', () => {
        const prev = 'text1';
        const next = 'text2';
        const operation: OtString.TwoWayOperation = TextOperation.diff({
            prev,
            next,
        })!;
        expect(
            restore(OtString.template)({
                nextState: next,
                downOperation: TextOperation.toDownOperation(operation),
            })
        ).toEqual(
            Result.ok({
                prevState: prev,
                twoWayOperation: operation,
            })
        );
    });

    it('tests ObjectTemplate', () => {
        const nextState: ObjectValue.State = {
            value1: 12,
            value2: 22,
            value3: undefined,
            value4: 42,
        };
        const downOperation: ObjectValue.DownOperation = {
            value1: {
                oldValue: 11,
            },
            value2: {
                oldValue: undefined,
            },
            value3: {
                oldValue: 31,
            },
        };

        expect(restore(ObjectValue.template)({ nextState, downOperation })).toEqual(
            Result.ok({
                prevState: {
                    value1: 11,
                    value2: undefined,
                    value3: 31,
                    value4: 42,
                },
                twoWayOperation: {
                    value1: {
                        oldValue: 11,
                        newValue: 12,
                    },
                    value2: {
                        oldValue: undefined,
                        newValue: 22,
                    },
                    value3: {
                        oldValue: 31,
                        newValue: undefined,
                    },
                },
            })
        );
    });

    it('tests RecordTemplate', () => {
        const nextState: RecordValue.State = {
            key1: { value: 12 },
            key3: { value: 32 },
            undefinedKey: undefined,
        };
        const downOperation: RecordValue.DownOperation = {
            key1: {
                type: update,
                update: {
                    value: {
                        oldValue: 11,
                    },
                },
            },
            key2: {
                type: replace,
                replace: {
                    oldValue: { value: 21 },
                },
            },
            key3: {
                type: replace,
                replace: {
                    oldValue: undefined,
                },
            },
            key4: undefined,
        };

        expect(restore(RecordValue.template)({ nextState, downOperation })).toEqual(
            Result.ok({
                prevState: {
                    key1: { value: 11 },
                    key2: { value: 21 },
                },
                twoWayOperation: {
                    key1: {
                        type: update,
                        update: {
                            value: {
                                oldValue: 11,
                                newValue: 12,
                            },
                        },
                    },
                    key2: {
                        type: replace,
                        replace: {
                            oldValue: { value: 21 },
                            newValue: undefined,
                        },
                    },
                    key3: {
                        type: replace,
                        replace: {
                            oldValue: undefined,
                            newValue: { value: 32 },
                        },
                    },
                },
            })
        );
    });
});

describe('diff', () => {
    it.each([
        [1, 2],
        [undefined, 2],
        [1, undefined],
    ] as const)('tests ReplaceValueTemplate', (oldValue, newValue) => {
        expect(diff(ReplaceValue.template)({ prevState: oldValue, nextState: newValue })).toEqual({
            oldValue,
            newValue,
        });
    });

    it('tests OtStringTemplate', () => {
        const prev = 'text1';
        const next = 'text2';
        const operation: OtString.TwoWayOperation = TextOperation.diff({
            prev,
            next,
        })!;
        expect(
            diff(OtString.template)({
                prevState: prev,
                nextState: next,
            })
        ).toEqual(operation);
    });

    it('tests ObjectTemplate', () => {
        const prevState: ObjectValue.State = {
            value1: 11,
            value2: undefined,
            value3: 31,
            value4: 42,
        };
        const nextState: ObjectValue.State = {
            value1: 12,
            value2: 22,
            value3: undefined,
            value4: 42,
        };

        expect(diff(ObjectValue.template)({ prevState, nextState })).toEqual({
            value1: {
                oldValue: 11,
                newValue: 12,
            },
            value2: {
                oldValue: undefined,
                newValue: 22,
            },
            value3: {
                oldValue: 31,
                newValue: undefined,
            },
        });
    });

    it('tests RecordTemplate', () => {
        const prevState: RecordValue.State = {
            key1: { value: 11 },
            key2: { value: 21 },
            undefinedKey: undefined,
        };
        const nextState: RecordValue.State = {
            key1: { value: 12 },
            key3: { value: 32 },
            undefinedKey: undefined,
        };

        expect(diff(RecordValue.template)({ prevState, nextState })).toEqual({
            key1: {
                type: update,
                update: {
                    value: {
                        oldValue: 11,
                        newValue: 12,
                    },
                },
            },
            key2: {
                type: replace,
                replace: {
                    oldValue: { value: 21 },
                    newValue: undefined,
                },
            },
            key3: {
                type: replace,
                replace: {
                    oldValue: undefined,
                    newValue: { value: 32 },
                },
            },
        });
    });
});

describe('clientTransform', () => {
    it.each([
        [1, 2],
        [1, undefined],
        [undefined, 2],
    ] as const)('tests ReplaceValueTemplate', (state1, state2) => {
        const first: ReplaceValue.UpOperation = {
            newValue: state1,
        };
        const second: ReplaceValue.UpOperation = {
            newValue: state2,
        };
        expect(clientTransform(ReplaceValue.template)({ first, second })).toEqual(
            Result.ok({
                firstPrime: first,
            })
        );
    });

    it('tests OtStringTemplate', () => {
        const state1 = 'text1';
        const state2 = 'text2';
        const state3 = 'text3';
        const first: OtString.UpOperation = TextOperation.toUpOperation(
            TextOperation.diff({
                prev: state1,
                next: state2,
            })!
        );
        const second: OtString.UpOperation = TextOperation.toUpOperation(
            TextOperation.diff({
                prev: state2,
                next: state3,
            })!
        );
        const expected = TextOperation.clientTransform({ first, second });
        expect(
            clientTransform(OtString.template)({
                first,
                second,
            })
        ).toEqual(expected);
    });

    it('tests ObjectTemplate', () => {
        const first: ObjectValue.UpOperation = {
            value1: {
                newValue: 11,
            },
            value2: {
                newValue: undefined,
            },
            value3: {
                newValue: 31,
            },
            value4: undefined,
        };
        const second: ObjectValue.UpOperation = {
            value1: {
                newValue: 12,
            },
            value2: {
                newValue: 22,
            },
            value3: {
                newValue: undefined,
            },
            value4: undefined,
        };

        expect(clientTransform(ObjectValue.template)({ first, second })).toEqual(
            Result.ok({
                firstPrime: {
                    value1: {
                        newValue: 11,
                    },
                    value2: {
                        newValue: undefined,
                    },
                    value3: {
                        newValue: 31,
                    },
                },
            })
        );
    });

    it('tests RecordTemplate', () => {
        const first: RecordValue.UpOperation = {
            idUpdate: undefined,
            updateId: {
                type: update,
                update: {
                    value: {
                        newValue: 1,
                    },
                },
            },
            idReplace: undefined,
            replaceId: {
                type: replace,
                replace: {
                    newValue: {
                        value: 1,
                    },
                },
            },
            updateUpdate: {
                type: update,
                update: {
                    value: {
                        newValue: 1,
                    },
                },
            },
            updateReplace: {
                type: update,
                update: {
                    value: {
                        newValue: 1,
                    },
                },
            },
            replaceUpdate: {
                type: replace,
                replace: {
                    newValue: undefined,
                },
            },
        };
        const second: RecordValue.UpOperation = {
            idUpdate: {
                type: update,
                update: {
                    value: {
                        newValue: 2,
                    },
                },
            },
            updateId: undefined,
            idReplace: {
                type: replace,
                replace: {
                    newValue: {
                        value: 2,
                    },
                },
            },
            replaceId: undefined,
            updateUpdate: {
                type: update,
                update: {
                    value: {
                        newValue: 2,
                    },
                },
            },
            updateReplace: {
                type: replace,
                replace: {
                    newValue: undefined,
                },
            },
            replaceUpdate: {
                type: update,
                update: {
                    value: {
                        newValue: 2,
                    },
                },
            },
        };
        const expectedFirstPrime: RecordValue.UpOperation = {
            idUpdate: undefined,
            updateId: {
                type: update,
                update: {
                    value: {
                        newValue: 1,
                    },
                },
            },
            idReplace: undefined,
            replaceId: {
                type: replace,
                replace: {
                    newValue: {
                        value: 1,
                    },
                },
            },
            updateUpdate: {
                type: update,
                update: {
                    value: {
                        newValue: 1,
                    },
                },
            },
            updateReplace: undefined,
            replaceUpdate: {
                type: replace,
                replace: {
                    newValue: undefined,
                },
            },
        };
        const expectedSecondPrime: RecordValue.UpOperation = {
            idUpdate: {
                type: update,
                update: {
                    value: {
                        newValue: 2,
                    },
                },
            },
            updateId: undefined,
            idReplace: {
                type: replace,
                replace: {
                    newValue: {
                        value: 2,
                    },
                },
            },
            replaceId: undefined,
            updateUpdate: undefined,
            updateReplace: {
                type: replace,
                replace: {
                    newValue: undefined,
                },
            },
            replaceUpdate: undefined,
        };

        expect(clientTransform(RecordValue.template)({ first, second })).toEqual(
            Result.ok({ firstPrime: expectedFirstPrime, secondPrime: expectedSecondPrime })
        );
    });
});
