import { z } from 'zod';
import * as StringPieceValueTypes from './types';
import { State, TwoWayOperation } from '@/ot/generator';
export declare const type: z.ZodUnion<[z.ZodObject<{
    $v: z.ZodLiteral<2>;
    $r: z.ZodLiteral<1>;
    type: z.ZodLiteral<"create">;
    value: z.ZodType<{
        $v: 2;
        $r: 1;
    } & {
        ownerCharacterId: string | undefined;
        isValuePrivate: boolean;
        value: string;
        valueInputType: "String" | "Number" | undefined;
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
        isValuePrivate: boolean;
        value: string;
        valueInputType: "String" | "Number" | undefined;
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
        isValuePrivate: boolean;
        value: string;
        valueInputType: "String" | "Number" | undefined;
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
        isValuePrivate: boolean;
        value: string;
        valueInputType: "String" | "Number" | undefined;
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
        isValuePrivate: boolean;
        value: string;
        valueInputType: "String" | "Number" | undefined;
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
        isValuePrivate: boolean;
        value: string;
        valueInputType: "String" | "Number" | undefined;
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
        isValuePrivate: boolean;
        value: string;
        valueInputType: "String" | "Number" | undefined;
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
        isValuePrivate: boolean;
        value: string;
        valueInputType: "String" | "Number" | undefined;
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
    isValuePrivateChanged: z.ZodOptional<z.ZodObject<{
        newValue: z.ZodUnion<[z.ZodString, z.ZodUndefined]>;
    }, "strip", z.ZodTypeAny, {
        newValue?: string | undefined;
    }, {
        newValue?: string | undefined;
    }>>;
    isValueChanged: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    ownerCharacterId?: {
        newValue?: string | undefined;
    } | undefined;
    isValuePrivateChanged?: {
        newValue?: string | undefined;
    } | undefined;
    isValueChanged?: boolean | undefined;
}, {
    ownerCharacterId?: {
        newValue?: string | undefined;
    } | undefined;
    isValuePrivateChanged?: {
        newValue?: string | undefined;
    } | undefined;
    isValueChanged?: boolean | undefined;
}>>]>;
export type Type = z.TypeOf<typeof type>;
export declare const ofOperation: (operation: TwoWayOperation<typeof StringPieceValueTypes.template>, currentState: State<typeof StringPieceValueTypes.template>) => Type;
//# sourceMappingURL=log.d.ts.map