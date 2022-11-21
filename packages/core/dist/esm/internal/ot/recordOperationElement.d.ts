import { z } from 'zod';
export declare const update = "update";
export declare const replace = "replace";
export declare const recordDownOperationElementFactory: <TState extends z.ZodTypeAny, TOperation extends z.ZodTypeAny>(state: TState, operation: TOperation) => z.ZodUnion<[z.ZodObject<{
    type: z.ZodLiteral<"replace">;
    replace: z.ZodObject<{
        oldValue: z.ZodOptional<TState>;
    }, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<{
        oldValue: TState["_output"] | undefined;
    }> extends infer T extends object ? { [k in keyof T]: z.objectUtil.addQuestionMarks<{
        oldValue: TState["_output"] | undefined;
    }>[k]; } : never, z.objectUtil.addQuestionMarks<{
        oldValue: TState["_input"] | undefined;
    }> extends infer T_1 extends object ? { [k_1 in keyof T_1]: z.objectUtil.addQuestionMarks<{
        oldValue: TState["_input"] | undefined;
    }>[k_1]; } : never>;
}, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<{
    type: "replace";
    replace: z.objectUtil.addQuestionMarks<{
        oldValue: TState["_output"] | undefined;
    }> extends infer T extends object ? { [k in keyof T]: z.objectUtil.addQuestionMarks<{
        oldValue: TState["_output"] | undefined;
    }>[k]; } : never;
}> extends infer T_2 ? { [k_1 in keyof T_2]: z.objectUtil.addQuestionMarks<{
    type: "replace";
    replace: z.objectUtil.addQuestionMarks<{
        oldValue: TState["_output"] | undefined;
    }> extends infer T extends object ? { [k in keyof T]: z.objectUtil.addQuestionMarks<{
        oldValue: TState["_output"] | undefined;
    }>[k]; } : never;
}>[k_1]; } : never, z.objectUtil.addQuestionMarks<{
    type: "replace";
    replace: z.objectUtil.addQuestionMarks<{
        oldValue: TState["_input"] | undefined;
    }> extends infer T_1 extends object ? { [k_1 in keyof T_1]: z.objectUtil.addQuestionMarks<{
        oldValue: TState["_input"] | undefined;
    }>[k_1]; } : never;
}> extends infer T_3 ? { [k_3 in keyof T_3]: z.objectUtil.addQuestionMarks<{
    type: "replace";
    replace: z.objectUtil.addQuestionMarks<{
        oldValue: TState["_input"] | undefined;
    }> extends infer T_1 extends object ? { [k_1 in keyof T_1]: z.objectUtil.addQuestionMarks<{
        oldValue: TState["_input"] | undefined;
    }>[k_1]; } : never;
}>[k_3]; } : never>, z.ZodObject<{
    type: z.ZodLiteral<"update">;
    update: TOperation;
}, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<{
    type: "update";
    update: TOperation["_output"];
}> extends infer T_4 ? { [k_1_1 in keyof T_4]: z.objectUtil.addQuestionMarks<{
    type: "update";
    update: TOperation["_output"];
}>[k_1_1]; } : never, z.objectUtil.addQuestionMarks<{
    type: "update";
    update: TOperation["_input"];
}> extends infer T_5 ? { [k_3_1 in keyof T_5]: z.objectUtil.addQuestionMarks<{
    type: "update";
    update: TOperation["_input"];
}>[k_3_1]; } : never>]>;
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
    }, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<{
        newValue: TState["_output"] | undefined;
    }> extends infer T extends object ? { [k in keyof T]: z.objectUtil.addQuestionMarks<{
        newValue: TState["_output"] | undefined;
    }>[k]; } : never, z.objectUtil.addQuestionMarks<{
        newValue: TState["_input"] | undefined;
    }> extends infer T_1 extends object ? { [k_1 in keyof T_1]: z.objectUtil.addQuestionMarks<{
        newValue: TState["_input"] | undefined;
    }>[k_1]; } : never>;
}, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<{
    type: "replace";
    replace: z.objectUtil.addQuestionMarks<{
        newValue: TState["_output"] | undefined;
    }> extends infer T extends object ? { [k in keyof T]: z.objectUtil.addQuestionMarks<{
        newValue: TState["_output"] | undefined;
    }>[k]; } : never;
}> extends infer T_2 ? { [k_1 in keyof T_2]: z.objectUtil.addQuestionMarks<{
    type: "replace";
    replace: z.objectUtil.addQuestionMarks<{
        newValue: TState["_output"] | undefined;
    }> extends infer T extends object ? { [k in keyof T]: z.objectUtil.addQuestionMarks<{
        newValue: TState["_output"] | undefined;
    }>[k]; } : never;
}>[k_1]; } : never, z.objectUtil.addQuestionMarks<{
    type: "replace";
    replace: z.objectUtil.addQuestionMarks<{
        newValue: TState["_input"] | undefined;
    }> extends infer T_1 extends object ? { [k_1 in keyof T_1]: z.objectUtil.addQuestionMarks<{
        newValue: TState["_input"] | undefined;
    }>[k_1]; } : never;
}> extends infer T_3 ? { [k_3 in keyof T_3]: z.objectUtil.addQuestionMarks<{
    type: "replace";
    replace: z.objectUtil.addQuestionMarks<{
        newValue: TState["_input"] | undefined;
    }> extends infer T_1 extends object ? { [k_1 in keyof T_1]: z.objectUtil.addQuestionMarks<{
        newValue: TState["_input"] | undefined;
    }>[k_1]; } : never;
}>[k_3]; } : never>, z.ZodObject<{
    type: z.ZodLiteral<"update">;
    update: TOperation;
}, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<{
    type: "update";
    update: TOperation["_output"];
}> extends infer T_4 ? { [k_1_1 in keyof T_4]: z.objectUtil.addQuestionMarks<{
    type: "update";
    update: TOperation["_output"];
}>[k_1_1]; } : never, z.objectUtil.addQuestionMarks<{
    type: "update";
    update: TOperation["_input"];
}> extends infer T_5 ? { [k_3_1 in keyof T_5]: z.objectUtil.addQuestionMarks<{
    type: "update";
    update: TOperation["_input"];
}>[k_3_1]; } : never>]>;
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
 * @deprecated Consider using map(Dual)?KeyRecord(Up|Down)?Operation
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