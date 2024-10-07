import { z } from 'zod';
export declare const createOperation: <TVersion extends string | number, TRevision extends string | number, TProps extends z.ZodRawShape>(version: TVersion, revision: TRevision, props: TProps) => z.ZodObject<z.objectUtil.extendShape<{ [k in keyof TProps]: z.ZodOptional<TProps[k]>; }, {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
}>, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<z.objectUtil.extendShape<{ [k in keyof TProps]: z.ZodOptional<TProps[k]>; }, {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
}>>, any> extends infer T ? { [k_1 in keyof T]: z.objectUtil.addQuestionMarks<z.baseObjectOutputType<z.objectUtil.extendShape<{ [k in keyof TProps]: z.ZodOptional<TProps[k]>; }, {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
}>>, any>[k_1]; } : never, z.baseObjectInputType<z.objectUtil.extendShape<{ [k in keyof TProps]: z.ZodOptional<TProps[k]>; }, {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
}>> extends infer T_1 ? { [k_2 in keyof T_1]: z.baseObjectInputType<z.objectUtil.extendShape<{ [k in keyof TProps]: z.ZodOptional<TProps[k]>; }, {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
}>>[k_2]; } : never>;
//# sourceMappingURL=createOperation.d.ts.map