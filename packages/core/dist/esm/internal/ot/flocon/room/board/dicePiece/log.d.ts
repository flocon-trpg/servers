import { z } from 'zod';
import { State, TwoWayOperation } from '../../../../generator';
import * as DicePieceValueTypes from './types';
export declare const type: z.ZodUnion<[z.ZodObject<{
    $v: z.ZodLiteral<2>;
    $r: z.ZodLiteral<1>;
    type: z.ZodLiteral<"create">;
    value: z.ZodType<{
        $v: 2;
        $r: 1;
    } & {
        ownerCharacterId: string | undefined;
        dice: {
            [x: string]: ({
                $v: 1;
                $r: 1;
            } & {
                dieType: "D4" | "D6";
                isValuePrivate: boolean;
                value: number | undefined;
            }) | undefined;
        } | undefined;
        cellH: number;
        cellW: number;
        cellX: number;
        cellY: number;
        isCellMode: boolean;
        h: number;
        isPositionLocked: boolean;
        memo: string | undefined;
        name: string | undefined;
        opacity: number | undefined;
        w: number;
        x: number;
        y: number;
    }, z.ZodTypeDef, {
        $v: 2;
        $r: 1;
    } & {
        ownerCharacterId: string | undefined;
        dice: {
            [x: string]: ({
                $v: 1;
                $r: 1;
            } & {
                dieType: "D4" | "D6";
                isValuePrivate: boolean;
                value: number | undefined;
            }) | undefined;
        } | undefined;
        cellH: number;
        cellW: number;
        cellX: number;
        cellY: number;
        isCellMode: boolean;
        h: number;
        isPositionLocked: boolean;
        memo: string | undefined;
        name: string | undefined;
        opacity: number | undefined;
        w: number;
        x: number;
        y: number;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "create";
    value: {
        $v: 2;
        $r: 1;
    } & {
        ownerCharacterId: string | undefined;
        dice: {
            [x: string]: ({
                $v: 1;
                $r: 1;
            } & {
                dieType: "D4" | "D6";
                isValuePrivate: boolean;
                value: number | undefined;
            }) | undefined;
        } | undefined;
        cellH: number;
        cellW: number;
        cellX: number;
        cellY: number;
        isCellMode: boolean;
        h: number;
        isPositionLocked: boolean;
        memo: string | undefined;
        name: string | undefined;
        opacity: number | undefined;
        w: number;
        x: number;
        y: number;
    };
    $v: 2;
    $r: 1;
}, {
    type: "create";
    value: {
        $v: 2;
        $r: 1;
    } & {
        ownerCharacterId: string | undefined;
        dice: {
            [x: string]: ({
                $v: 1;
                $r: 1;
            } & {
                dieType: "D4" | "D6";
                isValuePrivate: boolean;
                value: number | undefined;
            }) | undefined;
        } | undefined;
        cellH: number;
        cellW: number;
        cellX: number;
        cellY: number;
        isCellMode: boolean;
        h: number;
        isPositionLocked: boolean;
        memo: string | undefined;
        name: string | undefined;
        opacity: number | undefined;
        w: number;
        x: number;
        y: number;
    };
    $v: 2;
    $r: 1;
}>, z.ZodObject<{
    $v: z.ZodLiteral<2>;
    $r: z.ZodLiteral<1>;
    type: z.ZodLiteral<"delete">;
    value: z.ZodType<{
        $v: 2;
        $r: 1;
    } & {
        ownerCharacterId: string | undefined;
        dice: {
            [x: string]: ({
                $v: 1;
                $r: 1;
            } & {
                dieType: "D4" | "D6";
                isValuePrivate: boolean;
                value: number | undefined;
            }) | undefined;
        } | undefined;
        cellH: number;
        cellW: number;
        cellX: number;
        cellY: number;
        isCellMode: boolean;
        h: number;
        isPositionLocked: boolean;
        memo: string | undefined;
        name: string | undefined;
        opacity: number | undefined;
        w: number;
        x: number;
        y: number;
    }, z.ZodTypeDef, {
        $v: 2;
        $r: 1;
    } & {
        ownerCharacterId: string | undefined;
        dice: {
            [x: string]: ({
                $v: 1;
                $r: 1;
            } & {
                dieType: "D4" | "D6";
                isValuePrivate: boolean;
                value: number | undefined;
            }) | undefined;
        } | undefined;
        cellH: number;
        cellW: number;
        cellX: number;
        cellY: number;
        isCellMode: boolean;
        h: number;
        isPositionLocked: boolean;
        memo: string | undefined;
        name: string | undefined;
        opacity: number | undefined;
        w: number;
        x: number;
        y: number;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "delete";
    value: {
        $v: 2;
        $r: 1;
    } & {
        ownerCharacterId: string | undefined;
        dice: {
            [x: string]: ({
                $v: 1;
                $r: 1;
            } & {
                dieType: "D4" | "D6";
                isValuePrivate: boolean;
                value: number | undefined;
            }) | undefined;
        } | undefined;
        cellH: number;
        cellW: number;
        cellX: number;
        cellY: number;
        isCellMode: boolean;
        h: number;
        isPositionLocked: boolean;
        memo: string | undefined;
        name: string | undefined;
        opacity: number | undefined;
        w: number;
        x: number;
        y: number;
    };
    $v: 2;
    $r: 1;
}, {
    type: "delete";
    value: {
        $v: 2;
        $r: 1;
    } & {
        ownerCharacterId: string | undefined;
        dice: {
            [x: string]: ({
                $v: 1;
                $r: 1;
            } & {
                dieType: "D4" | "D6";
                isValuePrivate: boolean;
                value: number | undefined;
            }) | undefined;
        } | undefined;
        cellH: number;
        cellW: number;
        cellX: number;
        cellY: number;
        isCellMode: boolean;
        h: number;
        isPositionLocked: boolean;
        memo: string | undefined;
        name: string | undefined;
        opacity: number | undefined;
        w: number;
        x: number;
        y: number;
    };
    $v: 2;
    $r: 1;
}>, z.ZodIntersection<z.ZodIntersection<z.ZodObject<{
    $v: z.ZodLiteral<2>;
    $r: z.ZodLiteral<1>;
    type: z.ZodLiteral<"update">;
}, "strip", z.ZodTypeAny, {
    type: "update";
    $v: 2;
    $r: 1;
}, {
    type: "update";
    $v: 2;
    $r: 1;
}>, z.ZodType<{
    $v: 2;
    $r: 1;
} & {
    cellH?: {
        newValue: number;
    } | undefined;
    cellW?: {
        newValue: number;
    } | undefined;
    cellX?: {
        newValue: number;
    } | undefined;
    cellY?: {
        newValue: number;
    } | undefined;
    isCellMode?: {
        newValue: boolean;
    } | undefined;
    h?: {
        newValue: number;
    } | undefined;
    isPositionLocked?: {
        newValue: boolean;
    } | undefined;
    memo?: {
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
    name?: {
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
    opacity?: {
        newValue: number | undefined;
    } | undefined;
    w?: {
        newValue: number;
    } | undefined;
    x?: {
        newValue: number;
    } | undefined;
    y?: {
        newValue: number;
    } | undefined;
}, z.ZodTypeDef, {
    $v: 2;
    $r: 1;
} & {
    cellH?: {
        newValue: number;
    } | undefined;
    cellW?: {
        newValue: number;
    } | undefined;
    cellX?: {
        newValue: number;
    } | undefined;
    cellY?: {
        newValue: number;
    } | undefined;
    isCellMode?: {
        newValue: boolean;
    } | undefined;
    h?: {
        newValue: number;
    } | undefined;
    isPositionLocked?: {
        newValue: boolean;
    } | undefined;
    memo?: {
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
    name?: {
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
    opacity?: {
        newValue: number | undefined;
    } | undefined;
    w?: {
        newValue: number;
    } | undefined;
    x?: {
        newValue: number;
    } | undefined;
    y?: {
        newValue: number;
    } | undefined;
}>>, z.ZodObject<{
    ownerCharacterId: z.ZodOptional<z.ZodObject<{
        newValue: z.ZodUnion<[z.ZodString, z.ZodUndefined]>;
    }, "strip", z.ZodTypeAny, {
        newValue?: string | undefined;
    }, {
        newValue?: string | undefined;
    }>>;
    dice: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodUnion<[z.ZodObject<{
        type: z.ZodLiteral<"replace">;
        replace: z.ZodObject<{
            newValue: z.ZodOptional<z.ZodType<{
                $v: 1;
                $r: 1;
            } & {
                dieType: "D4" | "D6";
                isValuePrivate: boolean;
                value: number | undefined;
            }, z.ZodTypeDef, {
                $v: 1;
                $r: 1;
            } & {
                dieType: "D4" | "D6";
                isValuePrivate: boolean;
                value: number | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            newValue?: ({
                $v: 1;
                $r: 1;
            } & {
                dieType: "D4" | "D6";
                isValuePrivate: boolean;
                value: number | undefined;
            }) | undefined;
        }, {
            newValue?: ({
                $v: 1;
                $r: 1;
            } & {
                dieType: "D4" | "D6";
                isValuePrivate: boolean;
                value: number | undefined;
            }) | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "replace";
        replace: {
            newValue?: ({
                $v: 1;
                $r: 1;
            } & {
                dieType: "D4" | "D6";
                isValuePrivate: boolean;
                value: number | undefined;
            }) | undefined;
        };
    }, {
        type: "replace";
        replace: {
            newValue?: ({
                $v: 1;
                $r: 1;
            } & {
                dieType: "D4" | "D6";
                isValuePrivate: boolean;
                value: number | undefined;
            }) | undefined;
        };
    }>, z.ZodObject<{
        type: z.ZodLiteral<"update">;
        update: z.ZodObject<z.extendShape<{
            dieType: z.ZodOptional<z.ZodObject<{
                newValue: z.ZodUnion<[z.ZodLiteral<"D4">, z.ZodLiteral<"D6">]>;
            }, "strip", z.ZodTypeAny, {
                newValue: "D4" | "D6";
            }, {
                newValue: "D4" | "D6";
            }>>;
            isValuePrivateChanged: z.ZodOptional<z.ZodObject<{
                newValue: z.ZodUnion<[z.ZodNumber, z.ZodUndefined]>;
            }, "strip", z.ZodTypeAny, {
                newValue?: number | undefined;
            }, {
                newValue?: number | undefined;
            }>>;
            isValueChanged: z.ZodOptional<z.ZodBoolean>;
        }, {
            $v: z.ZodLiteral<1>;
            $r: z.ZodLiteral<1>;
        }>, "strip", z.ZodTypeAny, {
            dieType?: {
                newValue: "D4" | "D6";
            } | undefined;
            isValuePrivateChanged?: {
                newValue?: number | undefined;
            } | undefined;
            isValueChanged?: boolean | undefined;
            $v: 1;
            $r: 1;
        }, {
            dieType?: {
                newValue: "D4" | "D6";
            } | undefined;
            isValuePrivateChanged?: {
                newValue?: number | undefined;
            } | undefined;
            isValueChanged?: boolean | undefined;
            $v: 1;
            $r: 1;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "update";
        update: {
            dieType?: {
                newValue: "D4" | "D6";
            } | undefined;
            isValuePrivateChanged?: {
                newValue?: number | undefined;
            } | undefined;
            isValueChanged?: boolean | undefined;
            $v: 1;
            $r: 1;
        };
    }, {
        type: "update";
        update: {
            dieType?: {
                newValue: "D4" | "D6";
            } | undefined;
            isValuePrivateChanged?: {
                newValue?: number | undefined;
            } | undefined;
            isValueChanged?: boolean | undefined;
            $v: 1;
            $r: 1;
        };
    }>]>, z.ZodUndefined]>>>;
}, "strip", z.ZodTypeAny, {
    ownerCharacterId?: {
        newValue?: string | undefined;
    } | undefined;
    dice?: Record<string, {
        type: "replace";
        replace: {
            newValue?: ({
                $v: 1;
                $r: 1;
            } & {
                dieType: "D4" | "D6";
                isValuePrivate: boolean;
                value: number | undefined;
            }) | undefined;
        };
    } | {
        type: "update";
        update: {
            dieType?: {
                newValue: "D4" | "D6";
            } | undefined;
            isValuePrivateChanged?: {
                newValue?: number | undefined;
            } | undefined;
            isValueChanged?: boolean | undefined;
            $v: 1;
            $r: 1;
        };
    } | undefined> | undefined;
}, {
    ownerCharacterId?: {
        newValue?: string | undefined;
    } | undefined;
    dice?: Record<string, {
        type: "replace";
        replace: {
            newValue?: ({
                $v: 1;
                $r: 1;
            } & {
                dieType: "D4" | "D6";
                isValuePrivate: boolean;
                value: number | undefined;
            }) | undefined;
        };
    } | {
        type: "update";
        update: {
            dieType?: {
                newValue: "D4" | "D6";
            } | undefined;
            isValuePrivateChanged?: {
                newValue?: number | undefined;
            } | undefined;
            isValueChanged?: boolean | undefined;
            $v: 1;
            $r: 1;
        };
    } | undefined> | undefined;
}>>]>;
export declare type Type = z.TypeOf<typeof type>;
export declare const ofOperation: (operation: TwoWayOperation<typeof DicePieceValueTypes.template>, currentState: State<typeof DicePieceValueTypes.template>) => Type;
//# sourceMappingURL=log.d.ts.map