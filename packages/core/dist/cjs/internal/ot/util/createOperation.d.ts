import { z } from 'zod';
export declare const createOperation: <TVersion extends string | number, TRevision extends string | number, TProps extends z.ZodRawShape>(version: TVersion, revision: TRevision, props: TProps) => z.ZodObject<Omit<{ [k_1 in keyof TProps]: z.ZodOptional<TProps[k_1]>; }, "$v" | "$r"> & {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
} extends infer T ? { [k in keyof T]: (Omit<{ [k_1 in keyof TProps]: z.ZodOptional<TProps[k_1]>; }, "$v" | "$r"> & {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
})[k]; } : never, "strip", z.ZodTypeAny, z.baseObjectOutputType<Omit<{ [k_1 in keyof TProps]: z.ZodOptional<TProps[k_1]>; }, "$v" | "$r"> & {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
} extends infer T ? { [k in keyof T]: (Omit<{ [k_1 in keyof TProps]: z.ZodOptional<TProps[k_1]>; }, "$v" | "$r"> & {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
})[k]; } : never> extends infer T_1 extends object ? { [k_2 in keyof T_1]: z.baseObjectOutputType<Omit<{ [k_1 in keyof TProps]: z.ZodOptional<TProps[k_1]>; }, "$v" | "$r"> & {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
} extends infer T ? { [k in keyof T]: (Omit<{ [k_1 in keyof TProps]: z.ZodOptional<TProps[k_1]>; }, "$v" | "$r"> & {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
})[k]; } : never>[k_2]; } : never, z.objectUtil.addQuestionMarks<(Omit<{ [k_1 in keyof TProps]: z.ZodOptional<TProps[k_1]>; }, "$v" | "$r"> & {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
} extends infer T ? { [k in keyof T]: (Omit<{ [k_1 in keyof TProps]: z.ZodOptional<TProps[k_1]>; }, "$v" | "$r"> & {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
})[k]; } : never) extends infer T_3 extends z.ZodRawShape ? { [k_4 in keyof T_3]: (Omit<{ [k_1 in keyof TProps]: z.ZodOptional<TProps[k_1]>; }, "$v" | "$r"> & {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
} extends infer T ? { [k in keyof T]: (Omit<{ [k_1 in keyof TProps]: z.ZodOptional<TProps[k_1]>; }, "$v" | "$r"> & {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
})[k]; } : never)[k_4]["_input"]; } : never> extends infer T_2 extends object ? { [k_3 in keyof T_2]: z.objectUtil.addQuestionMarks<(Omit<{ [k_1 in keyof TProps]: z.ZodOptional<TProps[k_1]>; }, "$v" | "$r"> & {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
} extends infer T ? { [k in keyof T]: (Omit<{ [k_1 in keyof TProps]: z.ZodOptional<TProps[k_1]>; }, "$v" | "$r"> & {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
})[k]; } : never) extends infer T_3 extends z.ZodRawShape ? { [k_4 in keyof T_3]: (Omit<{ [k_1 in keyof TProps]: z.ZodOptional<TProps[k_1]>; }, "$v" | "$r"> & {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
} extends infer T ? { [k in keyof T]: (Omit<{ [k_1 in keyof TProps]: z.ZodOptional<TProps[k_1]>; }, "$v" | "$r"> & {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
})[k]; } : never)[k_4]["_input"]; } : never>[k_3]; } : never>;
//# sourceMappingURL=createOperation.d.ts.map