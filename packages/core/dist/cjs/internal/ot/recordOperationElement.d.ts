import { z } from 'zod';
export declare const update = "update";
export declare const replace = "replace";
export declare const recordDownOperationElementFactory: <TState extends z.ZodTypeAny, TOperation extends z.ZodTypeAny>(state: TState, operation: TOperation) => z.ZodUnion<[z.ZodObject<{
    type: z.ZodLiteral<"replace">;
    replace: z.ZodObject<{
        oldValue: z.ZodOptional<TState>;
    }, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
        oldValue: z.ZodOptional<TState>;
    }>, any> extends infer T ? { [k in keyof T]: z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
        oldValue: z.ZodOptional<TState>;
    }>, any>[k]; } : never, z.baseObjectInputType<{
        oldValue: z.ZodOptional<TState>;
    }> extends infer T_1 ? { [k_1 in keyof T_1]: z.baseObjectInputType<{
        oldValue: z.ZodOptional<TState>;
    }>[k_1]; } : never>;
}, "strip", z.ZodTypeAny, { [k_2 in keyof z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    type: z.ZodLiteral<"replace">;
    replace: z.ZodObject<{
        oldValue: z.ZodOptional<TState>;
    }, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
        oldValue: z.ZodOptional<TState>;
    }>, any> extends infer T ? { [k in keyof T]: z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
        oldValue: z.ZodOptional<TState>;
    }>, any>[k]; } : never, z.baseObjectInputType<{
        oldValue: z.ZodOptional<TState>;
    }> extends infer T_1 ? { [k_1 in keyof T_1]: z.baseObjectInputType<{
        oldValue: z.ZodOptional<TState>;
    }>[k_1]; } : never>;
}>, any>]: z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    type: z.ZodLiteral<"replace">;
    replace: z.ZodObject<{
        oldValue: z.ZodOptional<TState>;
    }, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
        oldValue: z.ZodOptional<TState>;
    }>, any> extends infer T ? { [k in keyof T]: z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
        oldValue: z.ZodOptional<TState>;
    }>, any>[k]; } : never, z.baseObjectInputType<{
        oldValue: z.ZodOptional<TState>;
    }> extends infer T_1 ? { [k_1 in keyof T_1]: z.baseObjectInputType<{
        oldValue: z.ZodOptional<TState>;
    }>[k_1]; } : never>;
}>, any>[k_2]; }, { [k_1_1 in keyof z.baseObjectInputType<{
    type: z.ZodLiteral<"replace">;
    replace: z.ZodObject<{
        oldValue: z.ZodOptional<TState>;
    }, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
        oldValue: z.ZodOptional<TState>;
    }>, any> extends infer T ? { [k in keyof T]: z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
        oldValue: z.ZodOptional<TState>;
    }>, any>[k]; } : never, z.baseObjectInputType<{
        oldValue: z.ZodOptional<TState>;
    }> extends infer T_1 ? { [k_1 in keyof T_1]: z.baseObjectInputType<{
        oldValue: z.ZodOptional<TState>;
    }>[k_1]; } : never>;
}>]: z.baseObjectInputType<{
    type: z.ZodLiteral<"replace">;
    replace: z.ZodObject<{
        oldValue: z.ZodOptional<TState>;
    }, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
        oldValue: z.ZodOptional<TState>;
    }>, any> extends infer T ? { [k in keyof T]: z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
        oldValue: z.ZodOptional<TState>;
    }>, any>[k]; } : never, z.baseObjectInputType<{
        oldValue: z.ZodOptional<TState>;
    }> extends infer T_1 ? { [k_1 in keyof T_1]: z.baseObjectInputType<{
        oldValue: z.ZodOptional<TState>;
    }>[k_1]; } : never>;
}>[k_1_1]; }>, z.ZodObject<{
    type: z.ZodLiteral<"update">;
    update: TOperation;
}, "strip", z.ZodTypeAny, { [k_3 in keyof z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    type: z.ZodLiteral<"update">;
    update: TOperation;
}>, any>]: z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    type: z.ZodLiteral<"update">;
    update: TOperation;
}>, any>[k_3]; }, { [k_1_2 in keyof z.baseObjectInputType<{
    type: z.ZodLiteral<"update">;
    update: TOperation;
}>]: z.baseObjectInputType<{
    type: z.ZodLiteral<"update">;
    update: TOperation;
}>[k_1_2]; }>]>;
export type RecordDownOperationElement<TState, TOperation> = {
    type: typeof replace;
    replace: {
        oldValue?: TState;
    };
} | {
    type: typeof update;
    update: TOperation;
};
export declare const recordUpOperationElementFactory: <TState extends z.ZodTypeAny, TOperation extends z.ZodTypeAny>(state: TState, operation: TOperation) => z.ZodUnion<[z.ZodObject<{
    type: z.ZodLiteral<"replace">;
    replace: z.ZodObject<{
        newValue: z.ZodOptional<TState>;
    }, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
        newValue: z.ZodOptional<TState>;
    }>, any> extends infer T ? { [k in keyof T]: z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
        newValue: z.ZodOptional<TState>;
    }>, any>[k]; } : never, z.baseObjectInputType<{
        newValue: z.ZodOptional<TState>;
    }> extends infer T_1 ? { [k_1 in keyof T_1]: z.baseObjectInputType<{
        newValue: z.ZodOptional<TState>;
    }>[k_1]; } : never>;
}, "strip", z.ZodTypeAny, { [k_2 in keyof z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    type: z.ZodLiteral<"replace">;
    replace: z.ZodObject<{
        newValue: z.ZodOptional<TState>;
    }, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
        newValue: z.ZodOptional<TState>;
    }>, any> extends infer T ? { [k in keyof T]: z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
        newValue: z.ZodOptional<TState>;
    }>, any>[k]; } : never, z.baseObjectInputType<{
        newValue: z.ZodOptional<TState>;
    }> extends infer T_1 ? { [k_1 in keyof T_1]: z.baseObjectInputType<{
        newValue: z.ZodOptional<TState>;
    }>[k_1]; } : never>;
}>, any>]: z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    type: z.ZodLiteral<"replace">;
    replace: z.ZodObject<{
        newValue: z.ZodOptional<TState>;
    }, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
        newValue: z.ZodOptional<TState>;
    }>, any> extends infer T ? { [k in keyof T]: z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
        newValue: z.ZodOptional<TState>;
    }>, any>[k]; } : never, z.baseObjectInputType<{
        newValue: z.ZodOptional<TState>;
    }> extends infer T_1 ? { [k_1 in keyof T_1]: z.baseObjectInputType<{
        newValue: z.ZodOptional<TState>;
    }>[k_1]; } : never>;
}>, any>[k_2]; }, { [k_1_1 in keyof z.baseObjectInputType<{
    type: z.ZodLiteral<"replace">;
    replace: z.ZodObject<{
        newValue: z.ZodOptional<TState>;
    }, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
        newValue: z.ZodOptional<TState>;
    }>, any> extends infer T ? { [k in keyof T]: z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
        newValue: z.ZodOptional<TState>;
    }>, any>[k]; } : never, z.baseObjectInputType<{
        newValue: z.ZodOptional<TState>;
    }> extends infer T_1 ? { [k_1 in keyof T_1]: z.baseObjectInputType<{
        newValue: z.ZodOptional<TState>;
    }>[k_1]; } : never>;
}>]: z.baseObjectInputType<{
    type: z.ZodLiteral<"replace">;
    replace: z.ZodObject<{
        newValue: z.ZodOptional<TState>;
    }, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
        newValue: z.ZodOptional<TState>;
    }>, any> extends infer T ? { [k in keyof T]: z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
        newValue: z.ZodOptional<TState>;
    }>, any>[k]; } : never, z.baseObjectInputType<{
        newValue: z.ZodOptional<TState>;
    }> extends infer T_1 ? { [k_1 in keyof T_1]: z.baseObjectInputType<{
        newValue: z.ZodOptional<TState>;
    }>[k_1]; } : never>;
}>[k_1_1]; }>, z.ZodObject<{
    type: z.ZodLiteral<"update">;
    update: TOperation;
}, "strip", z.ZodTypeAny, { [k_3 in keyof z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    type: z.ZodLiteral<"update">;
    update: TOperation;
}>, any>]: z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    type: z.ZodLiteral<"update">;
    update: TOperation;
}>, any>[k_3]; }, { [k_1_2 in keyof z.baseObjectInputType<{
    type: z.ZodLiteral<"update">;
    update: TOperation;
}>]: z.baseObjectInputType<{
    type: z.ZodLiteral<"update">;
    update: TOperation;
}>[k_1_2]; }>]>;
export type RecordUpOperationElement<TState, TOperation> = {
    type: typeof replace;
    replace: {
        newValue?: TState;
    };
} | {
    type: typeof update;
    update: TOperation;
};
export type RecordTwoWayOperationElement<TState, TOperation> = {
    type: typeof replace;
    replace: {
        oldValue?: TState;
        newValue?: TState;
    };
} | {
    type: typeof update;
    update: TOperation;
};
/**
 * @deprecated Consider using map(DualKey)?Record(Up|Down)?Operation
 */
export declare const mapRecordOperationElement: <TReplace1, TReplace2, TUpdate1, TUpdate2>({ source, mapOperation, mapReplace, }: {
    source: {
        type: typeof replace;
        replace: TReplace1;
    } | {
        type: typeof update;
        update: TUpdate1;
    };
    mapReplace: (replace: TReplace1) => TReplace2;
    mapOperation: (operation: TUpdate1) => TUpdate2;
}) => {
    type: typeof replace;
    replace: TReplace2;
} | {
    type: typeof update;
    update: TUpdate2;
};
//# sourceMappingURL=recordOperationElement.d.ts.map