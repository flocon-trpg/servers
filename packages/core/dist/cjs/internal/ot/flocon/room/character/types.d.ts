import { z } from 'zod';
import * as BoolParam from './boolParam/types';
import * as NumParam from './numParam/types';
import * as StrParam from './strParam/types';
import { State } from '@/ot/generator';
export declare const defaultBoolParamState: State<typeof BoolParam.template>;
export declare const defaultNumParamState: State<typeof NumParam.template>;
export declare const defaultStrParamState: State<typeof StrParam.template>;
export declare const template: {
    readonly type: "object";
    readonly $v: 2;
    readonly $r: 1;
    readonly value: {
        ownerParticipantId: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodUnion<[z.ZodString, z.ZodUndefined]>;
        };
        image: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodUnion<[z.ZodObject<{
                $v: z.ZodLiteral<1>;
                $r: z.ZodLiteral<1>;
                path: z.ZodString;
                sourceType: z.ZodUnion<[z.ZodLiteral<"Default">, z.ZodLiteral<"Uploader">, z.ZodLiteral<"FirebaseStorage">]>;
            }, "strip", z.ZodTypeAny, {
                path: string;
                $v: 1;
                $r: 1;
                sourceType: "Default" | "Uploader" | "FirebaseStorage";
            }, {
                path: string;
                $v: 1;
                $r: 1;
                sourceType: "Default" | "Uploader" | "FirebaseStorage";
            }>, z.ZodUndefined]>;
        };
        isPrivate: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodBoolean;
        };
        memo: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: false;
        };
        name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: false;
        };
        chatPalette: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: false;
        };
        privateVarToml: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: false;
        };
        portraitImage: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodUnion<[z.ZodObject<{
                $v: z.ZodLiteral<1>;
                $r: z.ZodLiteral<1>;
                path: z.ZodString;
                sourceType: z.ZodUnion<[z.ZodLiteral<"Default">, z.ZodLiteral<"Uploader">, z.ZodLiteral<"FirebaseStorage">]>;
            }, "strip", z.ZodTypeAny, {
                path: string;
                $v: 1;
                $r: 1;
                sourceType: "Default" | "Uploader" | "FirebaseStorage";
            }, {
                path: string;
                $v: 1;
                $r: 1;
                sourceType: "Default" | "Uploader" | "FirebaseStorage";
            }>, z.ZodUndefined]>;
        };
        hasTag1: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodBoolean;
        };
        hasTag2: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodBoolean;
        };
        hasTag3: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodBoolean;
        };
        hasTag4: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodBoolean;
        };
        hasTag5: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodBoolean;
        };
        hasTag6: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodBoolean;
        };
        hasTag7: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodBoolean;
        };
        hasTag8: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodBoolean;
        };
        hasTag9: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodBoolean;
        };
        hasTag10: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodBoolean;
        };
        boolParams: {
            readonly type: "paramRecord";
            readonly value: {
                readonly type: "object";
                readonly $v: 2;
                readonly $r: 1;
                readonly value: {
                    isValuePrivate: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodBoolean;
                    };
                    value: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodUnion<[z.ZodBoolean, z.ZodUndefined]>;
                    };
                    overriddenParameterName: {
                        readonly type: "atomic";
                        readonly mode: "ot";
                        readonly nullable: true;
                    };
                };
            };
            readonly defaultState: {
                $v: 2;
                $r: 1;
            } & {
                isValuePrivate: boolean;
                value: boolean | undefined;
                overriddenParameterName: string | undefined;
            };
        };
        numParams: {
            readonly type: "paramRecord";
            readonly value: {
                readonly type: "object";
                readonly $v: 2;
                readonly $r: 1;
                readonly value: {
                    isValuePrivate: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodBoolean;
                    };
                    value: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodUnion<[z.ZodNumber, z.ZodUndefined]>;
                    };
                    overriddenParameterName: {
                        readonly type: "atomic";
                        readonly mode: "ot";
                        readonly nullable: true;
                    };
                };
            };
            readonly defaultState: {
                $v: 2;
                $r: 1;
            } & {
                isValuePrivate: boolean;
                value: number | undefined;
                overriddenParameterName: string | undefined;
            };
        };
        numMaxParams: {
            readonly type: "paramRecord";
            readonly value: {
                readonly type: "object";
                readonly $v: 2;
                readonly $r: 1;
                readonly value: {
                    isValuePrivate: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodBoolean;
                    };
                    value: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodUnion<[z.ZodNumber, z.ZodUndefined]>;
                    };
                    overriddenParameterName: {
                        readonly type: "atomic";
                        readonly mode: "ot";
                        readonly nullable: true;
                    };
                };
            };
            readonly defaultState: {
                $v: 2;
                $r: 1;
            } & {
                isValuePrivate: boolean;
                value: number | undefined;
                overriddenParameterName: string | undefined;
            };
        };
        strParams: {
            readonly type: "paramRecord";
            readonly value: {
                readonly type: "object";
                readonly $v: 2;
                readonly $r: 1;
                readonly value: {
                    isValuePrivate: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodBoolean;
                    };
                    value: {
                        readonly type: "atomic";
                        readonly mode: "ot";
                        readonly nullable: true;
                    };
                    overriddenParameterName: {
                        readonly type: "atomic";
                        readonly mode: "ot";
                        readonly nullable: true;
                    };
                };
            };
            readonly defaultState: {
                $v: 2;
                $r: 1;
            } & {
                isValuePrivate: boolean;
                value: string | undefined;
                overriddenParameterName: string | undefined;
            };
        };
        pieces: {
            readonly type: "record";
            readonly value: {
                readonly type: "object";
                readonly $v: 2;
                readonly $r: 1;
                readonly value: {
                    boardId: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodString;
                    };
                    isPrivate: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodBoolean;
                    };
                    cellH: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodNumber;
                    };
                    cellW: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodNumber;
                    };
                    cellX: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodNumber;
                    };
                    cellY: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodNumber;
                    };
                    isCellMode: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodBoolean;
                    };
                    h: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodNumber;
                    };
                    isPositionLocked: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodBoolean;
                    };
                    memo: {
                        readonly type: "atomic";
                        readonly mode: "ot";
                        readonly nullable: true;
                    };
                    name: {
                        readonly type: "atomic";
                        readonly mode: "ot";
                        readonly nullable: true;
                    };
                    opacity: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodUnion<[z.ZodNumber, z.ZodUndefined]>;
                    };
                    w: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodNumber;
                    };
                    x: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodNumber;
                    };
                    y: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodNumber;
                    };
                };
            };
        };
        privateCommands: {
            readonly type: "record";
            readonly value: {
                readonly type: "object";
                readonly $v: 1;
                readonly $r: 1;
                readonly value: {
                    name: {
                        readonly type: "atomic";
                        readonly mode: "ot";
                        readonly nullable: false;
                    };
                    value: {
                        readonly type: "atomic";
                        readonly mode: "ot";
                        readonly nullable: false;
                    };
                };
            };
        };
        portraitPieces: {
            readonly type: "record";
            readonly value: {
                readonly type: "object";
                readonly $v: 2;
                readonly $r: 1;
                readonly value: {
                    boardId: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodString;
                    };
                    isPrivate: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodBoolean;
                    };
                    h: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodNumber;
                    };
                    isPositionLocked: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodBoolean;
                    };
                    memo: {
                        readonly type: "atomic";
                        readonly mode: "ot";
                        readonly nullable: true;
                    };
                    name: {
                        readonly type: "atomic";
                        readonly mode: "ot";
                        readonly nullable: true;
                    };
                    opacity: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodUnion<[z.ZodNumber, z.ZodUndefined]>;
                    };
                    w: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodNumber;
                    };
                    x: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodNumber;
                    };
                    y: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodNumber;
                    };
                };
            };
        };
    };
};
//# sourceMappingURL=types.d.ts.map