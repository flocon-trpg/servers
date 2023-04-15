import * as TextOperationCore from '@kizahasi/ot-core';
import { NonEmptyString } from '@kizahasi/ot-string';
import { Result } from '@kizahasi/result';
import { z } from 'zod';
import { replace, update } from './recordOperationElement';
import * as TextOperation from './textOperation';
type ApplyError = TextOperationCore.ApplyError<NonEmptyString, TextOperationCore.PositiveInt>;
type ComposeAndTransformUpError = TextOperationCore.ComposeAndTransformError<TextOperationCore.PositiveInt, NonEmptyString>;
type ComposeAndTransformDownError = TextOperationCore.ComposeAndTransformError<NonEmptyString, TextOperationCore.PositiveInt>;
type ComposeAndTransformTwoWayError = TextOperationCore.ComposeAndTransformError<NonEmptyString, NonEmptyString>;
export declare const downOperation: z.ZodUnion<[z.ZodObject<{
    type: z.ZodLiteral<"replace">;
    replace: z.ZodObject<{
        oldValue: z.ZodUnion<[z.ZodString, z.ZodUndefined]>;
    }, "strip", z.ZodTypeAny, {
        oldValue?: string | undefined;
    }, {
        oldValue?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "replace";
    replace: {
        oldValue?: string | undefined;
    };
}, {
    type: "replace";
    replace: {
        oldValue?: string | undefined;
    };
}>, z.ZodObject<{
    type: z.ZodLiteral<"update">;
    update: z.ZodArray<z.ZodUnion<[z.ZodObject<{
        t: z.ZodLiteral<"r">;
        r: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        t: "r";
        r: number;
    }, {
        t: "r";
        r: number;
    }>, z.ZodObject<{
        t: z.ZodLiteral<"i">;
        i: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        t: "i";
        i: number;
    }, {
        t: "i";
        i: number;
    }>, z.ZodObject<{
        t: z.ZodLiteral<"d">;
        d: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        t: "d";
        d: string;
    }, {
        t: "d";
        d: string;
    }>]>, "many">;
}, "strip", z.ZodTypeAny, {
    type: "update";
    update: ({
        t: "r";
        r: number;
    } | {
        t: "i";
        i: number;
    } | {
        t: "d";
        d: string;
    })[];
}, {
    type: "update";
    update: ({
        t: "r";
        r: number;
    } | {
        t: "i";
        i: number;
    } | {
        t: "d";
        d: string;
    })[];
}>]>;
export type DownOperation = z.TypeOf<typeof downOperation>;
export declare const upOperation: z.ZodUnion<[z.ZodObject<{
    type: z.ZodLiteral<"replace">;
    replace: z.ZodObject<{
        newValue: z.ZodUnion<[z.ZodString, z.ZodUndefined]>;
    }, "strip", z.ZodTypeAny, {
        newValue?: string | undefined;
    }, {
        newValue?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "replace";
    replace: {
        newValue?: string | undefined;
    };
}, {
    type: "replace";
    replace: {
        newValue?: string | undefined;
    };
}>, z.ZodObject<{
    type: z.ZodLiteral<"update">;
    update: z.ZodArray<z.ZodUnion<[z.ZodObject<{
        t: z.ZodLiteral<"r">;
        r: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        t: "r";
        r: number;
    }, {
        t: "r";
        r: number;
    }>, z.ZodObject<{
        t: z.ZodLiteral<"i">;
        i: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        t: "i";
        i: string;
    }, {
        t: "i";
        i: string;
    }>, z.ZodObject<{
        t: z.ZodLiteral<"d">;
        d: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        t: "d";
        d: number;
    }, {
        t: "d";
        d: number;
    }>]>, "many">;
}, "strip", z.ZodTypeAny, {
    type: "update";
    update: ({
        t: "r";
        r: number;
    } | {
        t: "i";
        i: string;
    } | {
        t: "d";
        d: number;
    })[];
}, {
    type: "update";
    update: ({
        t: "r";
        r: number;
    } | {
        t: "i";
        i: string;
    } | {
        t: "d";
        d: number;
    })[];
}>]>;
export type UpOperation = z.TypeOf<typeof upOperation>;
export type TwoWayOperation = {
    type: typeof replace;
    replace: {
        oldValue: string;
        newValue: undefined;
    } | {
        oldValue: undefined;
        newValue: string;
    };
} | {
    type: typeof update;
    update: TextOperation.TwoWayOperation;
};
export declare const toUpOperation: (source: TwoWayOperation) => UpOperation;
export declare const toDownOperation: (source: TwoWayOperation) => DownOperation;
export declare const apply: (state: string | undefined, action: UpOperation | TwoWayOperation) => import("@kizahasi/result").Error<string> | import("@kizahasi/result").Error<TextOperationCore.ApplyError<NonEmptyString, TextOperationCore.PositiveInt>> | import("@kizahasi/result").Ok<string | undefined>;
export declare const applyBack: (state: string | undefined, action: DownOperation) => import("@kizahasi/result").Error<string> | import("@kizahasi/result").Error<TextOperationCore.ApplyError<NonEmptyString, TextOperationCore.PositiveInt>> | import("@kizahasi/result").Ok<string | undefined>;
export declare const composeDownOperation: (first: DownOperation | undefined, second: DownOperation | undefined) => Result<DownOperation | undefined, string | ApplyError | ComposeAndTransformUpError>;
export declare const diff: ({ prev, next, }: {
    prev: string | undefined;
    next: string | undefined;
}) => TwoWayOperation | undefined;
export declare const restore: ({ nextState, downOperation, }: {
    nextState: string | undefined;
    downOperation: DownOperation | undefined;
}) => Result<{
    prevState: string | undefined;
    twoWayOperation: TwoWayOperation | undefined;
}, string | ApplyError>;
export declare const serverTransform: ({ first, second, prevState, }: {
    first?: TwoWayOperation | undefined;
    second?: {
        type: "replace";
        replace: {
            newValue?: string | undefined;
        };
    } | {
        type: "update";
        update: ({
            t: "r";
            r: number;
        } | {
            t: "i";
            i: string;
        } | {
            t: "d";
            d: number;
        })[];
    } | undefined;
    prevState: string | undefined;
}) => Result<TwoWayOperation | undefined, string | ApplyError | ComposeAndTransformTwoWayError>;
export declare const clientTransform: ({ first, second, }: {
    first: UpOperation | undefined;
    second: UpOperation | undefined;
}) => Result<{
    firstPrime?: UpOperation;
    secondPrime?: UpOperation;
}, string | ComposeAndTransformDownError>;
export {};
//# sourceMappingURL=nullableTextOperation.d.ts.map