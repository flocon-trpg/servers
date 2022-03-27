import {
    createReplaceValueTemplate as rep,
    createObjectValueTemplate as obj,
    otValueTemplate as otString,
    createRecordValueTemplate as rec,
    state,
    State as StateType,
    upOperation,
    UpOperation as UpOperationType,
    downOperation,
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
import { Option } from '@kizahasi/option';

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
    export const template = obj(
        {
            value1: ReplaceValue.template,
            value2: ReplaceValue.template,
            value3: ReplaceValue.template,
            value4: ReplaceValue.template,
        },
        1,
        2
    );
    export type State = StateType<typeof template>;
    export type UpOperation = UpOperationType<typeof template>;
    export type DownOperation = DownOperationType<typeof template>;
    export type TwoWayOperation = TwoWayOperationType<typeof template>;
}

namespace RecordValue {
    export const template = rec(
        obj(
            {
                value: ReplaceValue.template,
            },
            1,
            2
        )
    );
    export type State = StateType<typeof template>;
    export type DownOperation = DownOperationType<typeof template>;
    export type UpOperation = UpOperationType<typeof template>;
    export type TwoWayOperation = TwoWayOperationType<typeof template>;
}

describe('state', () => {
    it.each`
        source       | expected
        ${1}         | ${Option.some(1)}
        ${undefined} | ${Option.some(undefined)}
        ${'str'}     | ${Option.none()}
    `(
        'tests ReplaceValueTemplate {source: $source, expected: $expected}',
        ({ source, expected }) => {
            const actual = state(ReplaceValue.template).decode(source);
            if (actual._tag === 'Left') {
                expect(expected.isNone).toBe(true);
                return;
            }
            expect(actual.right).toEqual(expected.value);
        }
    );

    it.each`
        source       | expected
        ${1}         | ${Option.none()}
        ${undefined} | ${Option.none()}
        ${'str'}     | ${Option.some('str')}
    `('tests OtStringTemplate {source: $source, expected: $expected}', ({ source, expected }) => {
        const actual = state(OtString.template).decode(source);
        if (actual._tag === 'Left') {
            expect(expected.isNone).toBe(true);
            return;
        }
        expect(actual.right).toEqual(expected.value);
    });

    it.each`
        source                                                   | expected
        ${1}                                                     | ${Option.none()}
        ${undefined}                                             | ${Option.none()}
        ${{}}                                                    | ${Option.none()}
        ${{ $v: 10, $r: 20 }}                                    | ${Option.none()}
        ${{ $v: 1, $r: 2 }}                                      | ${Option.some({ $v: 1, $r: 2 })}
        ${{ $v: 1, $r: 2, value1: 1, value2: 2 }}                | ${Option.some({ $v: 1, $r: 2, value1: 1, value2: 2 })}
        ${{ $v: 1, $r: 2, value1: 1, value2: 2, invalidKey: 3 }} | ${Option.some({ $v: 1, $r: 2, value1: 1, value2: 2 })}
        ${{ value1: 1, value2: '2' }}                            | ${Option.none()}
    `('tests ObjectTemplate {source: $source, expected: $expected}', ({ source, expected }) => {
        const actual = state(ObjectValue.template).decode(source);
        if (actual._tag === 'Left') {
            expect(expected.isNone).toBe(true);
            return;
        }
        expect(actual.right).toEqual(expected.value);
    });

    it.each`
        source                                                                        | expected
        ${1}                                                                          | ${Option.none()}
        ${undefined}                                                                  | ${Option.none()}
        ${{}}                                                                         | ${Option.some({})}
        ${{ value1: { $v: 1, $r: 2, value: 1 }, value2: { $v: 1, $r: 2, value: 2 } }} | ${Option.some({ value1: { $v: 1, $r: 2, value: 1 }, value2: { $v: 1, $r: 2, value: 2 } })}
        ${{ value1: 1, value2: 2 }}                                                   | ${Option.none()}
        ${{ value1: 1, value2: { $v: 1, $r: 2, value: 2 } }}                          | ${Option.none()}
    `('tests RecordTemplate {source: $source, expected: $expected}', ({ source, expected }) => {
        const actual = state(RecordValue.template).decode(source);
        if (actual._tag === 'Left') {
            expect(expected.isNone).toBe(true);
            return;
        }
        expect(actual.right).toEqual(expected.value);
    });
});

describe('upOperation', () => {
    it.each`
        source                                                                                | expected
        ${undefined}                                                                          | ${Option.none()}
        ${'str'}                                                                              | ${Option.none()}
        ${{ newValue: 1 }}                                                                    | ${Option.some({ newValue: 1 })}
        ${{}}                                                                                 | ${Option.some({})}
        ${{ newValue: 'str' }}                                                                | ${Option.none()}
        ${TextOperation.toUpOperation(TextOperation.diff({ prev: 'text1', next: 'text2' })!)} | ${Option.none()}
    `(
        'tests ReplaceValueTemplate {source: $source, expected: $expected}',
        ({ source, expected }) => {
            const actual = upOperation(ReplaceValue.template).decode(source);
            if (actual._tag === 'Left') {
                expect(expected.isNone).toBe(true);
                return;
            }
            expect(actual.right).toEqual(expected.value);
        }
    );

    it.each`
        source                                                                                  | expected
        ${{}}                                                                                   | ${Option.none()}
        ${undefined}                                                                            | ${Option.none()}
        ${'str'}                                                                                | ${Option.none()}
        ${{ newValue: 1 }}                                                                      | ${Option.none()}
        ${TextOperation.toUpOperation(TextOperation.diff({ prev: 'text1', next: 'text2' })!)}   | ${Option.some(TextOperation.toUpOperation(TextOperation.diff({ prev: 'text1', next: 'text2' })!))}
        ${TextOperation.toDownOperation(TextOperation.diff({ prev: 'text1', next: 'text2' })!)} | ${Option.none()}
        ${TextOperation.diff({ prev: 'text1', next: 'text2' })}                                 | ${Option.none()}
    `('tests OtStringTemplate {source: $source, expected: $expected}', ({ source, expected }) => {
        const actual = upOperation(OtString.template).decode(source);
        if (actual._tag === 'Left') {
            expect(expected.isNone).toBe(true);
            return;
        }
        expect(actual.right).toEqual(expected.value);
    });

    it.each`
        source                                                                                | expected
        ${undefined}                                                                          | ${Option.none()}
        ${'str'}                                                                              | ${Option.none()}
        ${{ value1: 1 }}                                                                      | ${Option.none()}
        ${TextOperation.toUpOperation(TextOperation.diff({ prev: 'text1', next: 'text2' })!)} | ${Option.none()}
        ${{}}                                                                                 | ${Option.none()}
        ${{ $v: 10, $r: 20 }}                                                                 | ${Option.none()}
        ${{ $v: 1, $r: 2 }}                                                                   | ${Option.some({ $v: 1, $r: 2 })}
        ${{ $v: 1, $r: 2, x: 1 }}                                                             | ${Option.some({ $v: 1, $r: 2 })}
        ${{ $v: 1, $r: 2, value1: undefined, value2: undefined }}                             | ${Option.some({ $v: 1, $r: 2 })}
        ${{ $v: 1, $r: 2, value1: { newValue: 1 } }}                                          | ${Option.some({ $v: 1, $r: 2, value1: { newValue: 1 } })}
        ${{ $v: 1, $r: 2, value1: { newValue: 'str' } }}                                      | ${Option.none()}
        ${{ $v: 1, $r: 2, value1: { newValue: 1 }, value2: { newValue: 1 } }}                 | ${Option.some({ $v: 1, $r: 2, value1: { newValue: 1 }, value2: { newValue: 1 } })}
    `('tests ObjectTemplate {source: $source, expected: $expected}', ({ source, expected }) => {
        const actual = upOperation(ObjectValue.template).decode(source);
        if (actual._tag === 'Left') {
            expect(expected.isNone).toBe(true);
            return;
        }
        expect(actual.right).toEqual(expected.value);
    });

    it.each`
        source                                                                                                    | expected
        ${1}                                                                                                      | ${Option.none()}
        ${undefined}                                                                                              | ${Option.none()}
        ${{}}                                                                                                     | ${Option.some({})}
        ${{ value1: { $v: 1, $r: 2, value: { newValue: 1 } }, value2: { $v: 1, $r: 2, value: { newValue: 2 } } }} | ${Option.some({ value1: { $v: 1, $r: 2, value: { newValue: 1 } }, value2: { $v: 1, $r: 2, value: { newValue: 2 } } })}
        ${{ value1: 1, value2: 2 }}                                                                               | ${Option.none()}
        ${{ value1: 1, value2: { $v: 1, $r: 2, value: { newValue: 2 } } }}                                        | ${Option.none()}
    `('tests RecordTemplate {source: $source, expected: $expected}', ({ source, expected }) => {
        const actual = upOperation(RecordValue.template).decode(source);
        if (actual._tag === 'Left') {
            expect(expected.isNone).toBe(true);
            return;
        }
        expect(actual.right).toEqual(expected.value);
    });
});

describe('downOperation', () => {
    it.each`
        source                                                                                  | expected
        ${undefined}                                                                            | ${Option.none()}
        ${'str'}                                                                                | ${Option.none()}
        ${{ oldValue: 1 }}                                                                      | ${Option.some({ oldValue: 1 })}
        ${{}}                                                                                   | ${Option.some({})}
        ${{ oldValue: 'str' }}                                                                  | ${Option.none()}
        ${TextOperation.toDownOperation(TextOperation.diff({ prev: 'text1', next: 'text2' })!)} | ${Option.none()}
    `(
        'tests ReplaceValueTemplate {source: $source, expected: $expected}',
        ({ source, expected }) => {
            const actual = downOperation(ReplaceValue.template).decode(source);
            if (actual._tag === 'Left') {
                expect(expected.isNone).toBe(true);
                return;
            }
            expect(actual.right).toEqual(expected.value);
        }
    );

    it.each`
        source                                                                                  | expected
        ${{}}                                                                                   | ${Option.none()}
        ${undefined}                                                                            | ${Option.none()}
        ${'str'}                                                                                | ${Option.none()}
        ${{ oldValue: 1 }}                                                                      | ${Option.none()}
        ${TextOperation.toDownOperation(TextOperation.diff({ prev: 'text1', next: 'text2' })!)} | ${Option.some(TextOperation.toDownOperation(TextOperation.diff({ prev: 'text1', next: 'text2' })!))}
        ${TextOperation.toUpOperation(TextOperation.diff({ prev: 'text1', next: 'text2' })!)}   | ${Option.none()}
        ${TextOperation.diff({ prev: 'text1', next: 'text2' })}                                 | ${Option.none()}
    `('tests OtStringTemplate {source: $source, expected: $expected}', ({ source, expected }) => {
        const actual = downOperation(OtString.template).decode(source);
        if (actual._tag === 'Left') {
            expect(expected.isNone).toBe(true);
            return;
        }
        expect(actual.right).toEqual(expected.value);
    });

    it.each`
        source                                                                                  | expected
        ${undefined}                                                                            | ${Option.none()}
        ${'str'}                                                                                | ${Option.none()}
        ${{ value1: 1 }}                                                                        | ${Option.none()}
        ${TextOperation.toDownOperation(TextOperation.diff({ prev: 'text1', next: 'text2' })!)} | ${Option.none()}
        ${{}}                                                                                   | ${Option.none()}
        ${{ $v: 10, $r: 20 }}                                                                   | ${Option.none()}
        ${{ $v: 1, $r: 2 }}                                                                     | ${Option.some({ $v: 1, $r: 2 })}
        ${{ $v: 1, $r: 2, x: 1 }}                                                               | ${Option.some({ $v: 1, $r: 2 })}
        ${{ $v: 1, $r: 2, value1: undefined, value2: undefined }}                               | ${Option.some({ $v: 1, $r: 2 })}
        ${{ $v: 1, $r: 2, value1: { oldValue: 1 } }}                                            | ${Option.some({ $v: 1, $r: 2, value1: { oldValue: 1 } })}
        ${{ $v: 1, $r: 2, value1: { oldValue: 'str' } }}                                        | ${Option.none()}
        ${{ $v: 1, $r: 2, value1: { oldValue: 1 }, value2: { oldValue: 1 } }}                   | ${Option.some({ $v: 1, $r: 2, value1: { oldValue: 1 }, value2: { oldValue: 1 } })}
    `('tests ObjectTemplate {source: $source, expected: $expected}', ({ source, expected }) => {
        const actual = downOperation(ObjectValue.template).decode(source);
        if (actual._tag === 'Left') {
            expect(expected.isNone).toBe(true);
            return;
        }
        expect(actual.right).toEqual(expected.value);
    });

    it.each`
        source                                                                                                    | expected
        ${1}                                                                                                      | ${Option.none()}
        ${undefined}                                                                                              | ${Option.none()}
        ${{}}                                                                                                     | ${Option.some({})}
        ${{ value1: { $v: 1, $r: 2, value: { oldValue: 1 } }, value2: { $v: 1, $r: 2, value: { oldValue: 2 } } }} | ${Option.some({ value1: { $v: 1, $r: 2, value: { oldValue: 1 } }, value2: { $v: 1, $r: 2, value: { oldValue: 2 } } })}
        ${{ value1: 1, value2: 2 }}                                                                               | ${Option.none()}
        ${{ value1: 1, value2: { $v: 1, $r: 2, value: { oldValue: 2 } } }}                                        | ${Option.none()}
    `('tests RecordTemplate {source: $source, expected: $expected}', ({ source, expected }) => {
        const actual = downOperation(RecordValue.template).decode(source);
        if (actual._tag === 'Left') {
            expect(expected.isNone).toBe(true);
            return;
        }
        expect(actual.right).toEqual(expected.value);
    });
});

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
            $v: 1,
            $r: 2,
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
            $v: 1,
            $r: 2,
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
                    $v: 1,
                    $r: 2,
                    value: {
                        oldValue: 11,
                        newValue: 12,
                    },
                },
            },
            key2: {
                type: replace,
                replace: {
                    oldValue: {
                        $v: 1,
                        $r: 2,
                        value: 21,
                    },
                    newValue: undefined,
                },
            },
            key3: {
                type: replace,
                replace: {
                    oldValue: undefined,
                    newValue: {
                        $v: 1,
                        $r: 2,
                        value: 32,
                    },
                },
            },
            key4: undefined,
        };

        expect(toUpOperation(RecordValue.template)(source)).toEqual({
            key1: {
                type: update,
                update: {
                    $v: 1,
                    $r: 2,
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
                    newValue: {
                        $v: 1,
                        $r: 2,
                        value: 32,
                    },
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
            $v: 1,
            $r: 2,
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
            $v: 1,
            $r: 2,
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
                    $v: 1,
                    $r: 2,
                    value: {
                        oldValue: 11,
                        newValue: 12,
                    },
                },
            },
            key2: {
                type: replace,
                replace: {
                    oldValue: {
                        $v: 1,
                        $r: 2,
                        value: 21,
                    },
                    newValue: undefined,
                },
            },
            key3: {
                type: replace,
                replace: {
                    oldValue: undefined,
                    newValue: {
                        $v: 1,
                        $r: 2,
                        value: 32,
                    },
                },
            },
            key4: undefined,
        };

        expect(toDownOperation(RecordValue.template)(source)).toEqual({
            key1: {
                type: update,
                update: {
                    $v: 1,
                    $r: 2,
                    value: {
                        oldValue: 11,
                    },
                },
            },
            key2: {
                type: replace,
                replace: {
                    oldValue: {
                        $v: 1,
                        $r: 2,
                        value: 21,
                    },
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
            $v: 1,
            $r: 2,
            value1: 11,
            value2: undefined,
            value3: 31,
            value4: 41,
        };
        const operation: ObjectValue.UpOperation = {
            $v: 1,
            $r: 2,
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
                $v: 1,
                $r: 2,
                value1: 12,
                value2: 22,
                value4: 41,
            })
        );
    });

    it('tests RecordTemplate', () => {
        const state: RecordValue.State = {
            key1: {
                $v: 1,
                $r: 2,
                value: 11,
            },
            key2: {
                $v: 1,
                $r: 2,
                value: 21,
            },
            undefinedKey: undefined,
        };
        const operation: RecordValue.UpOperation = {
            key1: {
                type: update,
                update: {
                    $v: 1,
                    $r: 2,
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
                    newValue: {
                        $v: 1,
                        $r: 2,
                        value: 32,
                    },
                },
            },
            key4: undefined,
        };

        expect(apply(RecordValue.template)({ state, operation })).toEqual(
            Result.ok({
                key1: {
                    $v: 1,
                    $r: 2,
                    value: 12,
                },
                key3: {
                    $v: 1,
                    $r: 2,
                    value: 32,
                },
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
            $v: 1,
            $r: 2,
            value1: 12,
            value2: 22,
            value3: undefined,
            value4: 42,
        };
        const operation: ObjectValue.DownOperation = {
            $v: 1,
            $r: 2,
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
                $v: 1,
                $r: 2,
                value1: 11,
                value3: 31,
                value4: 42,
            })
        );
    });

    it('tests RecordTemplate', () => {
        const state: RecordValue.State = {
            key1: {
                $v: 1,
                $r: 2,
                value: 12,
            },
            key3: {
                $v: 1,
                $r: 2,
                value: 32,
            },
            undefinedKey: undefined,
        };
        const operation: RecordValue.DownOperation = {
            key1: {
                type: update,
                update: {
                    $v: 1,
                    $r: 2,
                    value: {
                        oldValue: 11,
                    },
                },
            },
            key2: {
                type: replace,
                replace: {
                    oldValue: {
                        $v: 1,
                        $r: 2,
                        value: 21,
                    },
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
                key1: {
                    $v: 1,
                    $r: 2,
                    value: 11,
                },
                key2: {
                    $v: 1,
                    $r: 2,
                    value: 21,
                },
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
            $v: 1,
            $r: 2,
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
            $v: 1,
            $r: 2,
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
                    $v: 1,
                    $r: 2,
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
                        $v: 1,
                        $r: 2,
                        value: 1,
                    },
                },
            },
            updateUpdate: {
                type: update,
                update: {
                    $v: 1,
                    $r: 2,
                    value: {
                        oldValue: 1,
                    },
                },
            },
            updateReplace: {
                type: update,
                update: {
                    $v: 1,
                    $r: 2,
                    value: {
                        oldValue: 1,
                    },
                },
            },
            replaceUpdate: {
                type: replace,
                replace: {
                    oldValue: {
                        $v: 1,
                        $r: 2,
                        value: 1,
                    },
                },
            },
        };
        const second: RecordValue.DownOperation = {
            idUpdate: {
                type: update,
                update: {
                    $v: 1,
                    $r: 2,
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
                        $v: 1,
                        $r: 2,
                        value: 2,
                    },
                },
            },
            replaceId: undefined,
            updateUpdate: {
                type: update,
                update: {
                    $v: 1,
                    $r: 2,
                    value: {
                        oldValue: 2,
                    },
                },
            },
            updateReplace: {
                type: replace,
                replace: {
                    oldValue: {
                        $v: 1,
                        $r: 2,
                        value: 2,
                    },
                },
            },
            replaceUpdate: {
                type: update,
                update: {
                    $v: 1,
                    $r: 2,
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
                    $v: 1,
                    $r: 2,
                    value: {
                        oldValue: 2,
                    },
                },
            },
            updateId: {
                type: update,
                update: {
                    $v: 1,
                    $r: 2,
                    value: {
                        oldValue: 1,
                    },
                },
            },
            idReplace: {
                type: replace,
                replace: {
                    oldValue: {
                        $v: 1,
                        $r: 2,
                        value: 2,
                    },
                },
            },
            replaceId: {
                type: replace,
                replace: {
                    oldValue: {
                        $v: 1,
                        $r: 2,
                        value: 1,
                    },
                },
            },
            updateUpdate: {
                type: update,
                update: {
                    $v: 1,
                    $r: 2,
                    value: {
                        oldValue: 1,
                    },
                },
            },
            updateReplace: {
                type: replace,
                replace: {
                    oldValue: {
                        $v: 1,
                        $r: 2,
                        value: 1,
                    },
                },
            },
            replaceUpdate: {
                type: replace,
                replace: {
                    oldValue: {
                        $v: 1,
                        $r: 2,
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
            $v: 1,
            $r: 2,
            value1: 12,
            value2: 22,
            value3: undefined,
            value4: 42,
        };
        const downOperation: ObjectValue.DownOperation = {
            $v: 1,
            $r: 2,
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
                    $v: 1,
                    $r: 2,
                    value1: 11,
                    value2: undefined,
                    value3: 31,
                    value4: 42,
                },
                twoWayOperation: {
                    $v: 1,
                    $r: 2,
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
            key1: {
                $v: 1,
                $r: 2,
                value: 12,
            },
            key3: {
                $v: 1,
                $r: 2,
                value: 32,
            },
            undefinedKey: undefined,
        };
        const downOperation: RecordValue.DownOperation = {
            key1: {
                type: update,
                update: {
                    $v: 1,
                    $r: 2,
                    value: {
                        oldValue: 11,
                    },
                },
            },
            key2: {
                type: replace,
                replace: {
                    oldValue: {
                        $v: 1,
                        $r: 2,
                        value: 21,
                    },
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
                    key1: {
                        $v: 1,
                        $r: 2,
                        value: 11,
                    },
                    key2: {
                        $v: 1,
                        $r: 2,
                        value: 21,
                    },
                },
                twoWayOperation: {
                    key1: {
                        type: update,
                        update: {
                            $v: 1,
                            $r: 2,
                            value: {
                                oldValue: 11,
                                newValue: 12,
                            },
                        },
                    },
                    key2: {
                        type: replace,
                        replace: {
                            oldValue: {
                                $v: 1,
                                $r: 2,
                                value: 21,
                            },
                            newValue: undefined,
                        },
                    },
                    key3: {
                        type: replace,
                        replace: {
                            oldValue: undefined,
                            newValue: {
                                $v: 1,
                                $r: 2,
                                value: 32,
                            },
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
            $v: 1,
            $r: 2,
            value1: 11,
            value2: undefined,
            value3: 31,
            value4: 42,
        };
        const nextState: ObjectValue.State = {
            $v: 1,
            $r: 2,
            value1: 12,
            value2: 22,
            value3: undefined,
            value4: 42,
        };

        expect(diff(ObjectValue.template)({ prevState, nextState })).toEqual({
            $v: 1,
            $r: 2,
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
            key1: {
                $v: 1,
                $r: 2,
                value: 11,
            },
            key2: {
                $v: 1,
                $r: 2,
                value: 21,
            },
            undefinedKey: undefined,
        };
        const nextState: RecordValue.State = {
            key1: {
                $v: 1,
                $r: 2,
                value: 12,
            },
            key3: {
                $v: 1,
                $r: 2,
                value: 32,
            },
            undefinedKey: undefined,
        };

        expect(diff(RecordValue.template)({ prevState, nextState })).toEqual({
            key1: {
                type: update,
                update: {
                    $v: 1,
                    $r: 2,
                    value: {
                        oldValue: 11,
                        newValue: 12,
                    },
                },
            },
            key2: {
                type: replace,
                replace: {
                    oldValue: {
                        $v: 1,
                        $r: 2,
                        value: 21,
                    },
                    newValue: undefined,
                },
            },
            key3: {
                type: replace,
                replace: {
                    oldValue: undefined,
                    newValue: {
                        $v: 1,
                        $r: 2,
                        value: 32,
                    },
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
            $v: 1,
            $r: 2,
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
            $v: 1,
            $r: 2,
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
                    $v: 1,
                    $r: 2,
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
                    $v: 1,
                    $r: 2,
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
                        $v: 1,
                        $r: 2,
                        value: 1,
                    },
                },
            },
            updateUpdate: {
                type: update,
                update: {
                    $v: 1,
                    $r: 2,
                    value: {
                        newValue: 1,
                    },
                },
            },
            updateReplace: {
                type: update,
                update: {
                    $v: 1,
                    $r: 2,
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
                    $v: 1,
                    $r: 2,
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
                        $v: 1,
                        $r: 2,
                        value: 2,
                    },
                },
            },
            replaceId: undefined,
            updateUpdate: {
                type: update,
                update: {
                    $v: 1,
                    $r: 2,
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
                    $v: 1,
                    $r: 2,
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
                    $v: 1,
                    $r: 2,
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
                        $v: 1,
                        $r: 2,
                        value: 1,
                    },
                },
            },
            updateUpdate: {
                type: update,
                update: {
                    $v: 1,
                    $r: 2,
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
                    $v: 1,
                    $r: 2,
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
                        $v: 1,
                        $r: 2,
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
