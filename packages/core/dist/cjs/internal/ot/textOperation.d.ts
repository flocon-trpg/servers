import { ComposeAndTransformError, NonEmptyString, PositiveInt } from '@kizahasi/ot-string';
import { Result } from '@kizahasi/result';
import { z } from 'zod';
declare const r = "r";
declare const i = "i";
declare const d = "d";
export declare const downOperation: z.ZodArray<z.ZodUnion<[z.ZodObject<{
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
export declare type DownOperation = z.TypeOf<typeof downOperation>;
export declare const upOperation: z.ZodArray<z.ZodUnion<[z.ZodObject<{
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
export declare type UpOperation = z.TypeOf<typeof upOperation>;
export declare type TwoWayOperation = ({
    t: typeof r;
    r: number;
} | {
    t: typeof i;
    i: string;
} | {
    t: typeof d;
    d: string;
})[];
export declare const apply: (state: string, action: UpOperation | TwoWayOperation) => Result<string, import("@kizahasi/ot-string").ApplyError<PositiveInt>>;
export declare const applyBack: (state: string, action: ({
    t: "r";
    r: number;
} | {
    t: "i";
    i: number;
} | {
    t: "d";
    d: string;
})[]) => Result<string, import("@kizahasi/ot-string").ApplyError<PositiveInt>>;
export declare const composeUpOperation: (first: UpOperation | undefined, second: UpOperation | undefined) => Result<UpOperation | undefined, ComposeAndTransformError<NonEmptyString, PositiveInt>>;
export declare const composeDownOperation: (first: DownOperation | undefined, second: DownOperation | undefined) => Result<DownOperation | undefined, ComposeAndTransformError<PositiveInt, NonEmptyString>>;
export declare const restore: ({ nextState, downOperation, }: {
    nextState: string;
    downOperation: DownOperation | undefined;
}) => import("@kizahasi/result").Error<import("@kizahasi/ot-string").ApplyError<PositiveInt>> | import("@kizahasi/result").Ok<{
    prevState: string;
    twoWayOperation: undefined;
}> | import("@kizahasi/result").Ok<{
    prevState: string;
    twoWayOperation: import("@kizahasi/ot-string").TwoWayOperationUnit[];
}>;
export declare const serverTransform: ({ first, second, prevState, }: {
    first?: TwoWayOperation | undefined;
    second?: ({
        t: "r";
        r: number;
    } | {
        t: "i";
        i: string;
    } | {
        t: "d";
        d: number;
    })[] | undefined;
    prevState: string;
}) => import("@kizahasi/result").Error<import("@kizahasi/ot-string").ApplyError<PositiveInt>> | import("@kizahasi/result").Error<ComposeAndTransformError<NonEmptyString, NonEmptyString>> | import("@kizahasi/result").Ok<import("@kizahasi/ot-string").TwoWayOperationUnit[] | undefined>;
export declare const clientTransform: ({ first, second, }: {
    first?: ({
        t: "r";
        r: number;
    } | {
        t: "i";
        i: string;
    } | {
        t: "d";
        d: number;
    })[] | undefined;
    second?: ({
        t: "r";
        r: number;
    } | {
        t: "i";
        i: string;
    } | {
        t: "d";
        d: number;
    })[] | undefined;
}) => import("@kizahasi/result").Error<ComposeAndTransformError<NonEmptyString, PositiveInt>> | import("@kizahasi/result").Ok<{
    firstPrime: undefined;
    secondPrime: undefined;
}> | import("@kizahasi/result").Ok<{
    firstPrime: undefined;
    secondPrime: import("@kizahasi/ot-string").UpOperationUnit[];
}> | import("@kizahasi/result").Ok<{
    firstPrime: import("@kizahasi/ot-string").UpOperationUnit[];
    secondPrime: undefined;
}> | import("@kizahasi/result").Ok<{
    firstPrime: import("@kizahasi/ot-string").UpOperationUnit[];
    secondPrime: import("@kizahasi/ot-string").UpOperationUnit[];
}>;
export declare const diff: ({ prev, next, }: {
    prev: string;
    next: string;
}) => TwoWayOperation | undefined;
export declare const toUpOperation: (source: TwoWayOperation) => ({
    t: "r";
    r: number;
} | {
    t: "i";
    i: string;
} | {
    t: "d";
    d: number;
})[];
export declare const toDownOperation: (source: TwoWayOperation) => ({
    t: "r";
    r: number;
} | {
    t: "i";
    i: number;
} | {
    t: "d";
    d: string;
})[];
export declare const toPrivateClientOperation: ({ oldValue, newValue, diff, isAuthorized, }: {
    oldValue: {
        isValuePrivate: boolean;
        value: string;
    };
    newValue: {
        isValuePrivate: boolean;
        value: string;
    };
    diff: TwoWayOperation | undefined;
    isAuthorized: boolean;
}) => UpOperation | undefined;
export {};
//# sourceMappingURL=textOperation.d.ts.map