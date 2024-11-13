import { Option } from '@kizahasi/option';
import { Result } from '@kizahasi/result';
import { z } from 'zod';
import { indexObjectTemplateValue } from '../array';
import * as NullableTextOperation from '../nullableTextOperation';
import { toOtError } from '../otError';
import { replace, update } from '../recordOperationElement';
import * as TextOperation from '../textOperation';
import {
    apply,
    applyBack,
    clientTransform,
    composeDownOperation,
    diff,
    restore,
    toDownOperation,
    toUpOperation,
} from './functions';
import {
    DownOperation as DownOperationType,
    State as StateType,
    TwoWayOperation as TwoWayOperationType,
    UpOperation as UpOperationType,
    downOperation,
    createObjectValueTemplate as obj,
    createTextValueTemplate as otString,
    createParamRecordValueTemplate as prec,
    createRecordValueTemplate as rec,
    createReplaceValueTemplate as rep,
    state,
    upOperation,
} from './types';

namespace ReplaceValue {
    export const template = rep(z.union([z.number(), z.undefined()]));
    export type UpOperation = UpOperationType<typeof template>;
    export type DownOperation = DownOperationType<typeof template>;
    export type TwoWayOperation = TwoWayOperationType<typeof template>;
}

namespace OtString {
    export const template = otString(false);
    export type UpOperation = UpOperationType<typeof template>;
    export type DownOperation = DownOperationType<typeof template>;
    export type TwoWayOperation = TwoWayOperationType<typeof template>;
}

namespace NullableOtString {
    export const template = otString(true);
    export type UpOperation = UpOperationType<typeof template>;
    export type DownOperation = DownOperationType<typeof template>;
    export type TwoWayOperation = TwoWayOperationType<typeof template>;
}

namespace ObjectValue {
    export const templateValue = {
        value1: ReplaceValue.template,
        value2: ReplaceValue.template,
        value3: ReplaceValue.template,
        value4: ReplaceValue.template,
    };

    export const template = obj(templateValue, 1, 2);
    export type State = StateType<typeof template>;
    export type UpOperation = UpOperationType<typeof template>;
    export type DownOperation = DownOperationType<typeof template>;
    export type TwoWayOperation = TwoWayOperationType<typeof template>;

    export namespace NoVersion {
        export const template = obj(
            {
                value1: ReplaceValue.template,
                value2: ReplaceValue.template,
                value3: ReplaceValue.template,
                value4: ReplaceValue.template,
            },
            undefined,
            undefined,
        );
        export type State = StateType<typeof template>;
        export type UpOperation = UpOperationType<typeof template>;
        export type DownOperation = DownOperationType<typeof template>;
        export type TwoWayOperation = TwoWayOperationType<typeof template>;
    }
}

namespace RecordValue {
    export const template = rec(
        obj(
            {
                value: ReplaceValue.template,
            },
            1,
            2,
        ),
    );
    export type State = StateType<typeof template>;
    export type DownOperation = DownOperationType<typeof template>;
    export type UpOperation = UpOperationType<typeof template>;
    export type TwoWayOperation = TwoWayOperationType<typeof template>;
}

namespace ArrayValue {
    export const template = rec(
        obj(
            {
                ...indexObjectTemplateValue,
                value: ReplaceValue.template,
            },
            1,
            2,
        ),
    );
    export type State = StateType<typeof template>;
    export type DownOperation = DownOperationType<typeof template>;
    export type UpOperation = UpOperationType<typeof template>;
    export type TwoWayOperation = TwoWayOperationType<typeof template>;
}

namespace ParamRecordValue {
    export const template = prec(
        obj(
            {
                value: ReplaceValue.template,
            },
            1,
            2,
        ),
        { $v: 1, $r: 2, value: 0 },
    );
    export type State = StateType<typeof template>;
    export type DownOperation = DownOperationType<typeof template>;
    export type UpOperation = UpOperationType<typeof template>;
    export type TwoWayOperation = TwoWayOperationType<typeof template>;
}

const toOption = <T>(source: z.SafeParseReturnType<any, T>) => {
    if (source.success) {
        return Option.some(source.data);
    }
    return Option.none();
};

describe('state', () => {
    it.each`
        source       | expected
        ${1}         | ${Option.some(1)}
        ${undefined} | ${Option.some(undefined)}
        ${'str'}     | ${Option.none()}
    `(
        'tests ReplaceValueTemplate {source: $source, expected: $expected}',
        ({ source, expected }) => {
            const actual = state(ReplaceValue.template).safeParse(source);
            expect(toOption(actual)).toEqual(expected);
        },
    );

    it.each`
        source       | expected
        ${1}         | ${Option.none()}
        ${null}      | ${Option.none()}
        ${undefined} | ${Option.none()}
        ${'str'}     | ${Option.some('str')}
    `('tests OtStringTemplate {source: $source, expected: $expected}', ({ source, expected }) => {
        const actual = state(OtString.template).safeParse(source);
        expect(toOption(actual)).toEqual(expected);
    });

    it.each`
        source       | expected
        ${1}         | ${Option.none()}
        ${null}      | ${Option.none()}
        ${undefined} | ${Option.some(undefined)}
        ${'str'}     | ${Option.some('str')}
    `(
        'tests NullableOtStringTemplate {source: $source, expected: $expected}',
        ({ source, expected }) => {
            const actual = state(NullableOtString.template).safeParse(source);
            expect(toOption(actual)).toEqual(expected);
        },
    );

    it.each`
        source                                                                        | expected
        ${1}                                                                          | ${Option.none()}
        ${undefined}                                                                  | ${Option.some(undefined)}
        ${{}}                                                                         | ${Option.some({})}
        ${{ value1: { $v: 1, $r: 2, value: 1 }, value2: { $v: 1, $r: 2, value: 2 } }} | ${Option.some({ value1: { $v: 1, $r: 2, value: 1 }, value2: { $v: 1, $r: 2, value: 2 } })}
        ${{ value1: 1, value2: 2 }}                                                   | ${Option.none()}
        ${{ value1: 1, value2: { $v: 1, $r: 2, value: 2 } }}                          | ${Option.none()}
    `('tests RecordTemplate {source: $source, expected: $expected}', ({ source, expected }) => {
        const actual = state(RecordValue.template).safeParse(source);
        expect(toOption(actual)).toEqual(expected);
    });

    it.each`
        source                                                                        | expected
        ${1}                                                                          | ${Option.none()}
        ${undefined}                                                                  | ${Option.some(undefined)}
        ${{}}                                                                         | ${Option.some({})}
        ${{ value1: { $v: 1, $r: 2, value: 1 }, value2: { $v: 1, $r: 2, value: 2 } }} | ${Option.some({ value1: { $v: 1, $r: 2, value: 1 }, value2: { $v: 1, $r: 2, value: 2 } })}
        ${{ value1: 1, value2: 2 }}                                                   | ${Option.none()}
        ${{ value1: 1, value2: { $v: 1, $r: 2, value: 2 } }}                          | ${Option.none()}
    `(
        'tests ParamRecordTemplate {source: $source, expected: $expected}',
        ({ source, expected }) => {
            const actual = state(ParamRecordValue.template).safeParse(source);
            expect(toOption(actual)).toEqual(expected);
        },
    );

    it.each`
        source              | expected
        ${{}}               | ${Option.some({})}
        ${{ $v: 1 }}        | ${Option.none()}
        ${{ $r: 2 }}        | ${Option.none()}
        ${{ $v: 1, $r: 2 }} | ${Option.none()}
    `(
        'tests ObjectTemplate(NoVersion) {source: $source, expected: $expected}',
        ({ source, expected }) => {
            const actual = state(ObjectValue.NoVersion.template).safeParse(source);
            expect(toOption(actual)).toEqual(expected);
        },
    );

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
    `('tests ObjectTemplate { source: $source, expected: $expected}', ({ source, expected }) => {
        const actual = state(ObjectValue.template).safeParse(source);
        expect(toOption(actual)).toEqual(expected);
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
            const actual = upOperation(ReplaceValue.template).safeParse(source);
            expect(toOption(actual)).toEqual(expected);
        },
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
        const actual = upOperation(OtString.template).safeParse(source);
        expect(toOption(actual)).toEqual(expected);
    });

    it.each`
        source                                                                                                  | expected
        ${{}}                                                                                                   | ${Option.none()}
        ${undefined}                                                                                            | ${Option.none()}
        ${'str'}                                                                                                | ${Option.none()}
        ${{ newValue: 1 }}                                                                                      | ${Option.none()}
        ${NullableTextOperation.toUpOperation(NullableTextOperation.diff({ prev: 'text1', next: 'text2' })!)}   | ${Option.some(NullableTextOperation.toUpOperation(NullableTextOperation.diff({ prev: 'text1', next: 'text2' })!))}
        ${NullableTextOperation.toUpOperation(NullableTextOperation.diff({ prev: undefined, next: 'text2' })!)} | ${Option.some(NullableTextOperation.toUpOperation(NullableTextOperation.diff({ prev: undefined, next: 'text2' })!))}
        ${NullableTextOperation.toUpOperation(NullableTextOperation.diff({ prev: 'text1', next: undefined })!)} | ${Option.some(NullableTextOperation.toUpOperation(NullableTextOperation.diff({ prev: 'text1', next: undefined })!))}
        ${NullableTextOperation.toDownOperation(NullableTextOperation.diff({ prev: 'text1', next: 'text2' })!)} | ${Option.none()}
        ${NullableTextOperation.diff({ prev: 'text1', next: 'text2' })}                                         | ${Option.none()}
    `(
        'tests NullableOtStringTemplate {source: $source, expected: $expected}',
        ({ source, expected }) => {
            const actual = upOperation(NullableOtString.template).safeParse(source);
            expect(toOption(actual)).toEqual(expected);
        },
    );

    const validRecordOperation = {
        value1: { type: update, update: { $v: 1, $r: 2, value: { newValue: 1 } } },
        value2: { type: replace, replace: { newValue: { $v: 1, $r: 2, value: 2 } } },
    };

    const validParamRecordOperation = {
        value1: { $v: 1, $r: 2, value: { newValue: 1 } },
        value2: { $v: 1, $r: 2, value: { newValue: 2 } },
    };

    it.each`
        source                                                             | expected
        ${1}                                                               | ${Option.none()}
        ${undefined}                                                       | ${Option.none()}
        ${{}}                                                              | ${Option.some({})}
        ${validRecordOperation}                                            | ${Option.some(validRecordOperation)}
        ${validParamRecordOperation}                                       | ${Option.none()}
        ${{ value1: 1, value2: 2 }}                                        | ${Option.none()}
        ${{ value1: 1, value2: { $v: 1, $r: 2, value: { newValue: 2 } } }} | ${Option.none()}
    `('tests RecordTemplate {source: $source, expected: $expected}', ({ source, expected }) => {
        const actual = upOperation(RecordValue.template).safeParse(source);
        expect(toOption(actual)).toEqual(expected);
    });

    it.each`
        source                                                             | expected
        ${1}                                                               | ${Option.none()}
        ${undefined}                                                       | ${Option.none()}
        ${{}}                                                              | ${Option.some({})}
        ${validRecordOperation}                                            | ${Option.none()}
        ${validParamRecordOperation}                                       | ${Option.some(validParamRecordOperation)}
        ${{ value1: 1, value2: 2 }}                                        | ${Option.none()}
        ${{ value1: 1, value2: { $v: 1, $r: 2, value: { newValue: 2 } } }} | ${Option.none()}
    `(
        'tests ParamRecordTemplate {source: $source, expected: $expected}',
        ({ source, expected }) => {
            const actual = upOperation(ParamRecordValue.template).safeParse(source);
            expect(toOption(actual)).toEqual(expected);
        },
    );

    it.each`
        source              | expected
        ${{}}               | ${Option.some({})}
        ${{ $v: 1 }}        | ${Option.none()}
        ${{ $r: 2 }}        | ${Option.none()}
        ${{ $v: 1, $r: 2 }} | ${Option.none()}
    `(
        'tests ObjectTemplate(NoVersion) {source: $source, expected: $expected}',
        ({ source, expected }) => {
            const actual = upOperation(ObjectValue.NoVersion.template).safeParse(source);
            expect(toOption(actual)).toEqual(expected);
        },
    );

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
    `('tests ObjectTemplate {source: $source,expected: $expected}', ({ source, expected }) => {
        const actual = upOperation(ObjectValue.template).safeParse(source);
        expect(toOption(actual)).toEqual(expected);
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
            const actual = downOperation(ReplaceValue.template).safeParse(source);
            expect(toOption(actual)).toEqual(expected);
        },
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
        const actual = downOperation(OtString.template).safeParse(source);
        expect(toOption(actual)).toEqual(expected);
    });

    it.each`
        source                                                                                                    | expected
        ${{}}                                                                                                     | ${Option.none()}
        ${undefined}                                                                                              | ${Option.none()}
        ${'str'}                                                                                                  | ${Option.none()}
        ${{ oldValue: 1 }}                                                                                        | ${Option.none()}
        ${NullableTextOperation.toDownOperation(NullableTextOperation.diff({ prev: 'text1', next: 'text2' })!)}   | ${Option.some(NullableTextOperation.toDownOperation(NullableTextOperation.diff({ prev: 'text1', next: 'text2' })!))}
        ${NullableTextOperation.toDownOperation(NullableTextOperation.diff({ prev: undefined, next: 'text2' })!)} | ${Option.some(NullableTextOperation.toDownOperation(NullableTextOperation.diff({ prev: undefined, next: 'text2' })!))}
        ${NullableTextOperation.toDownOperation(NullableTextOperation.diff({ prev: 'text1', next: undefined })!)} | ${Option.some(NullableTextOperation.toDownOperation(NullableTextOperation.diff({ prev: 'text1', next: undefined })!))}
        ${NullableTextOperation.toUpOperation(NullableTextOperation.diff({ prev: 'text1', next: 'text2' })!)}     | ${Option.none()}
        ${NullableTextOperation.diff({ prev: 'text1', next: 'text2' })}                                           | ${Option.none()}
    `(
        'tests NullableOtStringTemplate {source: $source, expected: $expected}',
        ({ source, expected }) => {
            const actual = downOperation(NullableOtString.template).safeParse(source);
            expect(toOption(actual)).toEqual(expected);
        },
    );

    const validRecordOperation = {
        value1: { type: update, update: { $v: 1, $r: 2, value: { oldValue: 1 } } },
        value2: { type: replace, replace: { oldValue: { $v: 1, $r: 2, value: 2 } } },
    };

    const validParamRecordOperation = {
        value1: { $v: 1, $r: 2, value: { oldValue: 1 } },
        value2: { $v: 1, $r: 2, value: { oldValue: 2 } },
    };

    it.each`
        source                                                             | expected
        ${1}                                                               | ${Option.none()}
        ${undefined}                                                       | ${Option.none()}
        ${{}}                                                              | ${Option.some({})}
        ${validRecordOperation}                                            | ${Option.some(validRecordOperation)}
        ${validParamRecordOperation}                                       | ${Option.none()}
        ${{ value1: 1, value2: 2 }}                                        | ${Option.none()}
        ${{ value1: 1, value2: { $v: 1, $r: 2, value: { oldValue: 2 } } }} | ${Option.none()}
    `('tests RecordTemplate {source: $source, expected: $expected}', ({ source, expected }) => {
        const actual = downOperation(RecordValue.template).safeParse(source);
        expect(toOption(actual)).toEqual(expected);
    });

    it.each`
        source                                                             | expected
        ${1}                                                               | ${Option.none()}
        ${undefined}                                                       | ${Option.none()}
        ${{}}                                                              | ${Option.some({})}
        ${validRecordOperation}                                            | ${Option.none()}
        ${validParamRecordOperation}                                       | ${Option.some(validParamRecordOperation)}
        ${{ value1: 1, value2: 2 }}                                        | ${Option.none()}
        ${{ value1: 1, value2: { $v: 1, $r: 2, value: { oldValue: 2 } } }} | ${Option.none()}
    `(
        'tests ParamRecordTemplate {source: $source, expected: $expected}',
        ({ source, expected }) => {
            const actual = downOperation(ParamRecordValue.template).safeParse(source);
            expect(toOption(actual)).toEqual(expected);
        },
    );

    it.each`
        source              | expected
        ${{}}               | ${Option.some({})}
        ${{ $v: 1 }}        | ${Option.none()}
        ${{ $r: 2 }}        | ${Option.none()}
        ${{ $v: 1, $r: 2 }} | ${Option.none()}
    `(
        'tests ObjectTemplate(NoVersion) {source: $source, expected: $expected}',
        ({ source, expected }) => {
            const actual = downOperation(ObjectValue.NoVersion.template).safeParse(source);
            expect(toOption(actual)).toEqual(expected);
        },
    );

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
    `('tests ObjectTemplate {source: $source expected: $expected}', ({ source, expected }) => {
        const actual = downOperation(ObjectValue.template).safeParse(source);
        expect(toOption(actual)).toEqual(expected);
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
            TextOperation.toUpOperation(source),
        );
    });

    it.each([
        ['text1', 'text2'],
        [undefined, 'text2'],
        ['text1', undefined],
    ])('tests NullableOtStringTemplate', (prev, next) => {
        const source: NullableOtString.TwoWayOperation = NullableTextOperation.diff({
            prev,
            next,
        })!;
        expect(toUpOperation(NullableOtString.template)(source)).toEqual(
            NullableTextOperation.toUpOperation(source),
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

    it('tests ParamRecordTemplate', () => {
        const source: ParamRecordValue.TwoWayOperation = {
            key1: {
                $v: 1,
                $r: 2,
                value: {
                    oldValue: 11,
                    newValue: 12,
                },
            },
            key2: undefined,
        };

        expect(toUpOperation(ParamRecordValue.template)(source)).toEqual({
            key1: {
                $v: 1,
                $r: 2,
                value: {
                    newValue: 12,
                },
            },
            key2: undefined,
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
            TextOperation.toDownOperation(source),
        );
    });

    it.each([
        ['text1', 'text2'],
        [undefined, 'text2'],
        ['text1', undefined],
    ])('tests NullableOtStringTemplate', (prev, next) => {
        const source: NullableOtString.TwoWayOperation = NullableTextOperation.diff({
            prev,
            next,
        })!;
        expect(toDownOperation(NullableOtString.template)(source)).toEqual(
            NullableTextOperation.toDownOperation(source),
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

    it('tests ParamRecordTemplate', () => {
        const source: ParamRecordValue.TwoWayOperation = {
            key1: {
                $v: 1,
                $r: 2,
                value: {
                    oldValue: 11,
                    newValue: 12,
                },
            },
            key2: undefined,
        };

        expect(toDownOperation(ParamRecordValue.template)(source)).toEqual({
            key1: {
                $v: 1,
                $r: 2,
                value: {
                    oldValue: 11,
                },
            },
            key2: undefined,
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
            }),
        ).toEqual(Result.ok(next));
    });

    it.each([
        ['text1', 'text2'],
        [undefined, 'text2'],
        ['text1', undefined],
    ])('tests NullableOtStringTemplate', (prev, next) => {
        const operation: NullableOtString.TwoWayOperation = NullableTextOperation.diff({
            prev,
            next,
        })!;
        expect(
            apply(NullableOtString.template)({
                state: prev,
                operation: NullableTextOperation.toUpOperation(operation),
            }),
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
            }),
        );
    });

    it('tests RecordTemplate (not {})', () => {
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
            }),
        );
    });

    it.each([{}, undefined] as RecordValue.State[])('tests RecordTemplate ({})', state => {
        const operation: RecordValue.UpOperation = {
            key: {
                type: replace,
                replace: {
                    newValue: {
                        $v: 1,
                        $r: 2,
                        value: 12,
                    },
                },
            },
        };

        expect(apply(RecordValue.template)({ state, operation })).toEqual(
            Result.ok({
                key: {
                    $v: 1,
                    $r: 2,
                    value: 12,
                },
            }),
        );
    });

    it('tests ParamRecordTemplate (not {})', () => {
        const state: ParamRecordValue.State = {
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
        const operation: ParamRecordValue.UpOperation = {
            key1: {
                $v: 1,
                $r: 2,
                value: {
                    newValue: 12,
                },
            },
            key3: {
                $v: 1,
                $r: 2,
                value: {
                    newValue: 32,
                },
            },
            key4: undefined,
        };

        expect(apply(ParamRecordValue.template)({ state, operation })).toEqual(
            Result.ok({
                key1: {
                    $v: 1,
                    $r: 2,
                    value: 12,
                },
                key2: {
                    $v: 1,
                    $r: 2,
                    value: 21,
                },
                key3: {
                    $v: 1,
                    $r: 2,
                    value: 32,
                },
            }),
        );
    });

    it.each([{}, undefined] as ParamRecordValue.State[])(
        'tests ParamRecordTemplate ({})',
        state => {
            const operation: ParamRecordValue.UpOperation = {
                key: {
                    $v: 1,
                    $r: 2,
                    value: {
                        newValue: 12,
                    },
                },
            };

            expect(apply(ParamRecordValue.template)({ state, operation })).toEqual(
                Result.ok({
                    key: {
                        $v: 1,
                        $r: 2,
                        value: 12,
                    },
                }),
            );
        },
    );
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
            }),
        ).toEqual(Result.ok(prev));
    });

    it.each([
        ['text1', 'text2'],
        [undefined, 'text2'],
        ['text1', undefined],
    ])('tests NullableOtStringTemplate', (prev, next) => {
        const operation: NullableOtString.TwoWayOperation = NullableTextOperation.diff({
            prev,
            next,
        })!;
        expect(
            applyBack(NullableOtString.template)({
                state: next,
                operation: NullableTextOperation.toDownOperation(operation),
            }),
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
            }),
        );
    });

    it('tests RecordTemplate (not {})', () => {
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
            }),
        );
    });

    it.each([{}, undefined] as RecordValue.State[])('tests RecordTemplate ({})', state => {
        const operation: RecordValue.DownOperation = {
            key: {
                type: replace,
                replace: {
                    oldValue: {
                        $v: 1,
                        $r: 2,
                        value: 11,
                    },
                },
            },
        };

        expect(applyBack(RecordValue.template)({ state, operation })).toEqual(
            Result.ok({
                key: {
                    $v: 1,
                    $r: 2,
                    value: 11,
                },
            }),
        );
    });

    it('tests ParamRecordTemplate (not {})', () => {
        const state: ParamRecordValue.State = {
            key1: {
                $v: 1,
                $r: 2,
                value: 12,
            },
            key2: {
                $v: 1,
                $r: 2,
                value: 22,
            },
            undefinedKey: undefined,
        };
        const operation: ParamRecordValue.DownOperation = {
            key1: {
                $v: 1,
                $r: 2,
                value: {
                    oldValue: 11,
                },
            },
            key3: {
                $v: 1,
                $r: 2,
                value: {
                    oldValue: 31,
                },
            },
            key4: undefined,
        };

        expect(applyBack(ParamRecordValue.template)({ state, operation })).toEqual(
            Result.ok({
                key1: {
                    $v: 1,
                    $r: 2,
                    value: 11,
                },
                key2: {
                    $v: 1,
                    $r: 2,
                    value: 22,
                },
                key3: {
                    $v: 1,
                    $r: 2,
                    value: 31,
                },
            }),
        );
    });

    it.each([{}, undefined] as ParamRecordValue.State[])(
        'tests ParamRecordTemplate ({})',
        state => {
            const operation: ParamRecordValue.DownOperation = {
                key: {
                    $v: 1,
                    $r: 2,
                    value: {
                        oldValue: 11,
                    },
                },
            };

            expect(applyBack(ParamRecordValue.template)({ state, operation })).toEqual(
                Result.ok({
                    key: {
                        $v: 1,
                        $r: 2,
                        value: 11,
                    },
                }),
            );
        },
    );
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
            }),
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
            })!,
        );
        const second: OtString.DownOperation = TextOperation.toDownOperation(
            TextOperation.diff({
                prev: state2,
                next: state3,
            })!,
        );
        const expected: OtString.DownOperation = TextOperation.toDownOperation(
            TextOperation.diff({
                prev: state1,
                next: state3,
            })!,
        );
        expect(
            composeDownOperation(OtString.template)({
                first,
                second,
            }),
        ).toEqual(Result.ok(expected));
    });

    it.each([
        ['text1', 'text2', 'text3'],
        [undefined, 'text2', 'text3'],
        ['text1', undefined, 'text3'],
        ['text1', 'text2', undefined],
        [undefined, 'text2', undefined],
    ])('tests NullableOtStringTemplate', (state1, state2, state3) => {
        const first: NullableOtString.DownOperation = NullableTextOperation.toDownOperation(
            NullableTextOperation.diff({
                prev: state1,
                next: state2,
            })!,
        );
        const second: NullableOtString.DownOperation = NullableTextOperation.toDownOperation(
            NullableTextOperation.diff({
                prev: state2,
                next: state3,
            })!,
        );
        const expected: NullableOtString.DownOperation = NullableTextOperation.composeDownOperation(
            first,
            second,
        ).value!;
        expect(
            composeDownOperation(NullableOtString.template)({
                first,
                second,
            }),
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
            Result.ok(first),
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
            Result.ok(expected),
        );
    });

    it('tests ParamRecordTemplate', () => {
        const first: ParamRecordValue.DownOperation = {
            idUpdate: undefined,
            updateId: {
                $v: 1,
                $r: 2,
                value: {
                    oldValue: 1,
                },
            },
            updateUpdate: {
                $v: 1,
                $r: 2,
                value: {
                    oldValue: 1,
                },
            },
        };
        const second: ParamRecordValue.DownOperation = {
            idUpdate: {
                $v: 1,
                $r: 2,
                value: {
                    oldValue: 2,
                },
            },
            updateId: undefined,
            updateUpdate: {
                $v: 1,
                $r: 2,
                value: {
                    oldValue: 2,
                },
            },
        };
        const expected: ParamRecordValue.DownOperation = {
            idUpdate: {
                $v: 1,
                $r: 2,
                value: {
                    oldValue: 2,
                },
            },
            updateId: {
                $v: 1,
                $r: 2,
                value: {
                    oldValue: 1,
                },
            },
            updateUpdate: {
                $v: 1,
                $r: 2,
                value: {
                    oldValue: 1,
                },
            },
        };

        expect(composeDownOperation(ParamRecordValue.template)({ first, second })).toEqual(
            Result.ok(expected),
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
            }),
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
            }),
        ).toEqual(
            Result.ok({
                prevState: prev,
                twoWayOperation: operation,
            }),
        );
    });

    it.each([
        ['text1', 'text2'],
        [undefined, 'text2'],
        ['text1', undefined],
    ])('tests NullableOtStringTemplate', (prev, next) => {
        const operation: NullableOtString.TwoWayOperation = NullableTextOperation.diff({
            prev,
            next,
        })!;
        expect(
            restore(NullableOtString.template)({
                nextState: next,
                downOperation: NullableTextOperation.toDownOperation(operation),
            }),
        ).toEqual(
            Result.ok({
                prevState: prev,
                twoWayOperation: operation,
            }),
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
            }),
        );
    });

    it('tests RecordTemplate (not {})', () => {
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
            }),
        );
    });

    it.each([undefined, {}] as RecordValue.State[])('tests RecordTemplate ({})', nextState => {
        const downOperation: RecordValue.DownOperation = {
            key: {
                type: replace,
                replace: {
                    oldValue: {
                        $v: 1,
                        $r: 2,
                        value: 11,
                    },
                },
            },
        };

        expect(restore(RecordValue.template)({ nextState, downOperation })).toEqual(
            Result.ok({
                prevState: {
                    key: {
                        $v: 1,
                        $r: 2,
                        value: 11,
                    },
                },
                twoWayOperation: {
                    key: {
                        type: replace,
                        replace: {
                            oldValue: {
                                $v: 1,
                                $r: 2,
                                value: 11,
                            },
                            newValue: undefined,
                        },
                    },
                },
            }),
        );
    });

    it('tests ParamRecordTemplate (not {})', () => {
        const nextState: ParamRecordValue.State = {
            key1: {
                $v: 1,
                $r: 2,
                value: 12,
            },
            undefinedKey: undefined,
        };
        const downOperation: ParamRecordValue.DownOperation = {
            key1: {
                $v: 1,
                $r: 2,
                value: {
                    oldValue: 11,
                },
            },
            key2: undefined,
        };

        expect(restore(ParamRecordValue.template)({ nextState, downOperation })).toEqual(
            Result.ok({
                prevState: {
                    key1: {
                        $v: 1,
                        $r: 2,
                        value: 11,
                    },
                },
                twoWayOperation: {
                    key1: {
                        $v: 1,
                        $r: 2,
                        value: {
                            oldValue: 11,
                            newValue: 12,
                        },
                    },
                    key2: undefined,
                },
            }),
        );
    });

    // nextStateが{}もしくはundefinedのときは、downOperationは{}もしくはundefinedしかありえないため、（正常系の）テストはしていない
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
            }),
        ).toEqual(operation);
    });

    it.each([
        ['text1', 'text2'],
        [undefined, 'text2'],
        ['text1', undefined],
    ])('tests NullableOtStringTemplate', (prev, next) => {
        const operation: NullableOtString.TwoWayOperation = NullableTextOperation.diff({
            prev,
            next,
        })!;
        expect(
            diff(NullableOtString.template)({
                prevState: prev,
                nextState: next,
            }),
        ).toEqual(operation);
    });

    it('tests ObjectTemplate(not id)', () => {
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

    it('tests ObjectTemplate(id)', () => {
        const prevState: ObjectValue.State = {
            $v: 1,
            $r: 2,
            value1: 11,
            value2: undefined,
            value3: 31,
            value4: 42,
        };
        const nextState: ObjectValue.State = {
            ...prevState,
        };

        expect(diff(ObjectValue.template)({ prevState, nextState })).toBeUndefined();
    });

    const prevRecord: RecordValue.State = {
        key: {
            $v: 1,
            $r: 2,
            value: 3,
        },
    };
    const nextRecord: RecordValue.State = {
        key: {
            $v: 1,
            $r: 2,
            value: 3,
        },
    };
    it.each([
        [undefined, undefined],
        [{}, {}],
        [{}, undefined],
        [undefined, {}],
        [prevRecord, nextRecord],
    ] as [RecordValue.State | undefined, RecordValue.State | undefined][])(
        'tests RecordTemplate(id)',
        (prevState, nextState) => {
            expect(diff(RecordValue.template)({ prevState, nextState })).toBeUndefined();
        },
    );

    it('tests RecordTemplate(not id)', () => {
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

    it('tests ParamRecordTemplate(not id)', () => {
        const prevState: ParamRecordValue.State = {
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
        const nextState: ParamRecordValue.State = {
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

        expect(diff(ParamRecordValue.template)({ prevState, nextState })).toEqual({
            key1: {
                $v: 1,
                $r: 2,
                value: {
                    oldValue: 11,
                    newValue: 12,
                },
            },
            key2: {
                $v: 1,
                $r: 2,
                value: {
                    oldValue: 21,
                    newValue: 0,
                },
            },
            key3: {
                $v: 1,
                $r: 2,
                value: {
                    oldValue: 0,
                    newValue: 32,
                },
            },
        });
    });

    const prevParamRecord: ParamRecordValue.State = {
        key: {
            $v: 1,
            $r: 2,
            value: 3,
        },
    };
    const nextParamRecord: ParamRecordValue.State = {
        key: {
            $v: 1,
            $r: 2,
            value: 3,
        },
    };
    it.each([
        [undefined, undefined],
        [{}, {}],
        [{}, undefined],
        [undefined, {}],
        [prevParamRecord, nextParamRecord],
    ] as [ParamRecordValue.State | undefined, ParamRecordValue.State | undefined][])(
        'tests ParamRecordTemplate(id)',
        (prevState, nextState) => {
            expect(diff(ParamRecordValue.template)({ prevState, nextState })).toBeUndefined();
        },
    );
});

describe('clientTransform', () => {
    it.each([
        [1, 2],
        [1, undefined],
        [undefined, 2],
    ] as const)('tests ReplaceValueTemplate', (state1, state2) => {
        const baseState = 0;
        const first: ReplaceValue.UpOperation = {
            newValue: state1,
        };
        const second: ReplaceValue.UpOperation = {
            newValue: state2,
        };
        expect(clientTransform(ReplaceValue.template)({ state: baseState, first, second })).toEqual(
            Result.ok({
                firstPrime: first,
            }),
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
            })!,
        );
        const second: OtString.UpOperation = TextOperation.toUpOperation(
            TextOperation.diff({
                prev: state1,
                next: state3,
            })!,
        );
        const expected = TextOperation.clientTransform({ first, second });
        expect(
            clientTransform(OtString.template)({
                state: state1,
                first,
                second,
            }),
        ).toEqual(expected);
    });

    it.each([
        ['text1', 'text2', 'text3'],
        [undefined, 'text2', 'text3'],
        ['text1', undefined, 'text3'],
        ['text1', 'text2', undefined],
        // [undefined, 'text2', undefined] のケースはsecondがidになりclientTransformが使えないためテスト対象外
    ])('tests NullableOtStringTemplate', (state1, state2, state3) => {
        const first: NullableOtString.UpOperation = NullableTextOperation.toUpOperation(
            NullableTextOperation.diff({
                prev: state1,
                next: state2,
            })!,
        );
        const second: NullableOtString.UpOperation = NullableTextOperation.toUpOperation(
            NullableTextOperation.diff({
                prev: state1,
                next: state3,
            })!,
        );
        const expected = NullableTextOperation.clientTransform({ first, second });
        expect(
            clientTransform(NullableOtString.template)({
                state: state1,
                first,
                second,
            }),
        ).toEqual(expected);
    });

    it('tests ObjectTemplate', () => {
        const baseState: ObjectValue.State = {
            $v: 1,
            $r: 2,
            value1: 10,
            value2: 20,
            value3: 30,
            value4: 40,
        };
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

        expect(clientTransform(ObjectValue.template)({ state: baseState, first, second })).toEqual(
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
            }),
        );
    });

    it('tests non-array RecordTemplate', () => {
        const baseState: RecordValue.State = {
            idUpdate: { $v: 1, $r: 2, value: 0 },
            updateId: { $v: 1, $r: 2, value: 0 },
            updateUpdate: { $v: 1, $r: 2, value: 0 },
            updateReplace: { $v: 1, $r: 2, value: 0 },
            replaceUpdate: { $v: 1, $r: 2, value: 0 },
        };
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

        expect(clientTransform(RecordValue.template)({ state: baseState, first, second })).toEqual(
            Result.ok({ firstPrime: expectedFirstPrime, secondPrime: expectedSecondPrime }),
        );
    });

    it('tests array RecordTemplate', () => {
        const baseState: ArrayValue.State = {
            key0: { $v: 1, $r: 2, $index: 0, value: 0 },
            key1: { $v: 1, $r: 2, $index: 1, value: 1 },
            key2: { $v: 1, $r: 2, $index: 2, value: 2 },
            key3: { $v: 1, $r: 2, $index: 3, value: 3 },
            key4: { $v: 1, $r: 2, $index: 4, value: 4 },
            key5: { $v: 1, $r: 2, $index: 5, value: 5 },
        };

        // swaps 1-4
        const first: ArrayValue.UpOperation = {
            key1: {
                type: update,
                update: {
                    $v: 1,
                    $r: 2,
                    $index: {
                        newValue: 4,
                    },
                },
            },
            key4: {
                type: update,
                update: {
                    $v: 1,
                    $r: 2,
                    $index: {
                        newValue: 1,
                    },
                },
            },
        };

        // insert between 2 and 3
        const second: ArrayValue.UpOperation = {
            key2_5: {
                type: replace,
                replace: {
                    newValue: {
                        $v: 1,
                        $r: 2,
                        $index: 3,
                        value: 2.5,
                    },
                },
            },
            key3: {
                type: update,
                update: {
                    $v: 1,
                    $r: 2,
                    $index: {
                        newValue: 4,
                    },
                },
            },
            key4: {
                type: update,
                update: {
                    $v: 1,
                    $r: 2,
                    $index: {
                        newValue: 5,
                    },
                },
            },
            key5: {
                type: update,
                update: {
                    $v: 1,
                    $r: 2,
                    $index: {
                        newValue: 6,
                    },
                },
            },
        };

        const transformed = clientTransform(ArrayValue.template)({
            state: baseState,
            first,
            second,
        });
        if (transformed.isError) {
            throw toOtError(transformed.error);
        }

        const stateAppliedFirst = apply(ArrayValue.template)({
            state: baseState,
            operation: first,
        });
        if (stateAppliedFirst.isError) {
            throw toOtError(stateAppliedFirst.error);
        }
        const stateAppliedSecond = apply(ArrayValue.template)({
            state: baseState,
            operation: second,
        });
        if (stateAppliedSecond.isError) {
            throw toOtError(stateAppliedSecond.error);
        }
        const stateAppliedFirstThenSecondPrime = apply(ArrayValue.template)({
            state: stateAppliedFirst.value,
            operation: transformed.value.secondPrime ?? {},
        });
        if (stateAppliedFirstThenSecondPrime.isError) {
            throw toOtError(stateAppliedFirstThenSecondPrime.error);
        }
        const stateAppliedSecondThenFirstPrime = apply(ArrayValue.template)({
            state: stateAppliedSecond.value,
            operation: transformed.value.firstPrime ?? {},
        });
        if (stateAppliedSecondThenFirstPrime.isError) {
            throw toOtError(stateAppliedSecondThenFirstPrime.error);
        }

        const finalState: ArrayValue.State = {
            key0: { $v: 1, $r: 2, $index: 0, value: 0 },
            key1: { $v: 1, $r: 2, $index: 5, value: 1 },
            key2: { $v: 1, $r: 2, $index: 2, value: 2 },
            key2_5: { $v: 1, $r: 2, $index: 3, value: 2.5 },
            key3: { $v: 1, $r: 2, $index: 4, value: 3 },
            key4: { $v: 1, $r: 2, $index: 1, value: 4 },
            key5: { $v: 1, $r: 2, $index: 6, value: 5 },
        };

        // $vや$rがあるoperationとないoperationが混在すること、idであるoperation(例えば元の値が3に対して {newValue: 3} というoperation)が来ることがありtoEqualでoperationをテストするのは手間がかかるため、代わりにoperationがapplyされたstateでテストしている
        expect(stateAppliedFirstThenSecondPrime.value).toEqual(finalState);
        expect(stateAppliedSecondThenFirstPrime.value).toEqual(finalState);
    });

    it('tests ParamRecordTemplate', () => {
        const baseState: ParamRecordValue.State = {};
        const first: ParamRecordValue.UpOperation = {
            idUpdate: undefined,
            updateId: {
                $v: 1,
                $r: 2,
                value: {
                    newValue: 1,
                },
            },
            updateUpdate: {
                $v: 1,
                $r: 2,
                value: {
                    newValue: 1,
                },
            },
        };
        const second: ParamRecordValue.UpOperation = {
            idUpdate: {
                $v: 1,
                $r: 2,
                value: {
                    newValue: 2,
                },
            },
            updateId: undefined,
            updateUpdate: {
                $v: 1,
                $r: 2,
                value: {
                    newValue: 2,
                },
            },
        };
        const expectedFirstPrime: ParamRecordValue.UpOperation = {
            idUpdate: undefined,
            updateId: {
                $v: 1,
                $r: 2,
                value: {
                    newValue: 1,
                },
            },
            updateUpdate: {
                $v: 1,
                $r: 2,
                value: {
                    newValue: 1,
                },
            },
        };
        const expectedSecondPrime: ParamRecordValue.UpOperation = {
            idUpdate: {
                $v: 1,
                $r: 2,
                value: {
                    newValue: 2,
                },
            },
            updateId: undefined,
            updateUpdate: undefined,
        };

        expect(
            clientTransform(ParamRecordValue.template)({ state: baseState, first, second }),
        ).toEqual(Result.ok({ firstPrime: expectedFirstPrime, secondPrime: expectedSecondPrime }));
    });
});
