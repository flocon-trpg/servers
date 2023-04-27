import { z } from 'zod';
export declare const createOperation: <TVersion extends string | number, TRevision extends string | number, TProps extends z.ZodRawShape>(version: TVersion, revision: TRevision, props: TProps) => z.ZodObject<Omit<{ [k_1 in keyof TProps]: z.ZodOptional<TProps[k_1]>; }, "$v" | "$r"> & {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
} extends infer T ? { [k in keyof T]: (Omit<{ [k_1 in keyof TProps]: z.ZodOptional<TProps[k_1]>; }, "$v" | "$r"> & {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
})[k]; } : never, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<Omit<{ [k_1 in keyof TProps]: z.ZodOptional<TProps[k_1]>; }, "$v" | "$r"> & {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
} extends infer T ? { [k in keyof T]: (Omit<{ [k_1 in keyof TProps]: z.ZodOptional<TProps[k_1]>; }, "$v" | "$r"> & {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
})[k]; } : never>, (z.baseObjectOutputType<Omit<{ [k_1 in keyof TProps]: z.ZodOptional<TProps[k_1]>; }, "$v" | "$r"> & {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
} extends infer T ? { [k in keyof T]: (Omit<{ [k_1 in keyof TProps]: z.ZodOptional<TProps[k_1]>; }, "$v" | "$r"> & {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
})[k]; } : never> extends infer T_2 extends object ? { [k_3 in keyof T_2]: undefined extends z.baseObjectOutputType<Omit<{ [k_1 in keyof TProps]: z.ZodOptional<TProps[k_1]>; }, "$v" | "$r"> & {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
} extends infer T ? { [k in keyof T]: (Omit<{ [k_1 in keyof TProps]: z.ZodOptional<TProps[k_1]>; }, "$v" | "$r"> & {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
})[k]; } : never>[k_3] ? never : k_3; } : never)["$v" | "$r" | Exclude<keyof TProps, "$v" | "$r">]> extends infer T_1 ? { [k_2 in keyof T_1]: z.objectUtil.addQuestionMarks<z.baseObjectOutputType<Omit<{ [k_1 in keyof TProps]: z.ZodOptional<TProps[k_1]>; }, "$v" | "$r"> & {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
} extends infer T ? { [k in keyof T]: (Omit<{ [k_1 in keyof TProps]: z.ZodOptional<TProps[k_1]>; }, "$v" | "$r"> & {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
})[k]; } : never>, (z.baseObjectOutputType<Omit<{ [k_1 in keyof TProps]: z.ZodOptional<TProps[k_1]>; }, "$v" | "$r"> & {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
} extends infer T ? { [k in keyof T]: (Omit<{ [k_1 in keyof TProps]: z.ZodOptional<TProps[k_1]>; }, "$v" | "$r"> & {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
})[k]; } : never> extends infer T_2 extends object ? { [k_3 in keyof T_2]: undefined extends z.baseObjectOutputType<Omit<{ [k_1 in keyof TProps]: z.ZodOptional<TProps[k_1]>; }, "$v" | "$r"> & {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
} extends infer T ? { [k in keyof T]: (Omit<{ [k_1 in keyof TProps]: z.ZodOptional<TProps[k_1]>; }, "$v" | "$r"> & {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
})[k]; } : never>[k_3] ? never : k_3; } : never)["$v" | "$r" | Exclude<keyof TProps, "$v" | "$r">]>[k_2]; } : never, z.baseObjectInputType<Omit<{ [k_1 in keyof TProps]: z.ZodOptional<TProps[k_1]>; }, "$v" | "$r"> & {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
} extends infer T ? { [k in keyof T]: (Omit<{ [k_1 in keyof TProps]: z.ZodOptional<TProps[k_1]>; }, "$v" | "$r"> & {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
})[k]; } : never> extends infer T_3 ? { [k_4 in keyof T_3]: z.baseObjectInputType<Omit<{ [k_1 in keyof TProps]: z.ZodOptional<TProps[k_1]>; }, "$v" | "$r"> & {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
} extends infer T ? { [k in keyof T]: (Omit<{ [k_1 in keyof TProps]: z.ZodOptional<TProps[k_1]>; }, "$v" | "$r"> & {
    $v: z.ZodLiteral<TVersion>;
    $r: z.ZodLiteral<TRevision>;
})[k]; } : never>[k_4]; } : never>;
//# sourceMappingURL=createOperation.d.ts.map