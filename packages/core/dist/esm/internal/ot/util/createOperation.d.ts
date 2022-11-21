import { z } from 'zod';
export declare const createOperation: <TVersion extends string | number, TRevision extends string | number, TProps extends z.ZodRawShape>(version: TVersion, revision: TRevision, props: TProps) => z.ZodObject<z.extendShape<{ [k in keyof TProps]: z.ZodOptional<TProps[k]>; }, {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
}>, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.extendShape<{ [k in keyof TProps]: z.ZodOptional<TProps[k]>; }, {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
}> extends infer T_1 extends z.ZodRawShape ? { [k_2 in keyof T_1]: z.extendShape<{ [k in keyof TProps]: z.ZodOptional<TProps[k]>; }, {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
}>[k_2]["_output"]; } : never> extends infer T extends object ? { [k_1 in keyof T]: z.objectUtil.addQuestionMarks<z.extendShape<{ [k in keyof TProps]: z.ZodOptional<TProps[k]>; }, {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
}> extends infer T_1 extends z.ZodRawShape ? { [k_2 in keyof T_1]: z.extendShape<{ [k in keyof TProps]: z.ZodOptional<TProps[k]>; }, {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
}>[k_2]["_output"]; } : never>[k_1]; } : never, z.objectUtil.addQuestionMarks<z.extendShape<{ [k in keyof TProps]: z.ZodOptional<TProps[k]>; }, {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
}> extends infer T_3 extends z.ZodRawShape ? { [k_4 in keyof T_3]: z.extendShape<{ [k in keyof TProps]: z.ZodOptional<TProps[k]>; }, {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
}>[k_4]["_input"]; } : never> extends infer T_2 extends object ? { [k_3 in keyof T_2]: z.objectUtil.addQuestionMarks<z.extendShape<{ [k in keyof TProps]: z.ZodOptional<TProps[k]>; }, {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
}> extends infer T_3 extends z.ZodRawShape ? { [k_4 in keyof T_3]: z.extendShape<{ [k in keyof TProps]: z.ZodOptional<TProps[k]>; }, {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
}>[k_4]["_input"]; } : never>[k_3]; } : never>;
//# sourceMappingURL=createOperation.d.ts.map