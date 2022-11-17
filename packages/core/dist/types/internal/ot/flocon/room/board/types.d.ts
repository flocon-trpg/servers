import { z } from 'zod';
export declare const template: {
    readonly type: "object";
    readonly $v: 2;
    readonly $r: 1;
    readonly value: {
        backgroundImage: {
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
        backgroundImageZoom: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodNumber;
        };
        cellColumnCount: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodNumber;
        };
        cellHeight: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodNumber;
        };
        cellOffsetX: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodNumber;
        };
        cellOffsetY: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodNumber;
        };
        cellRowCount: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodNumber;
        };
        cellWidth: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodNumber;
        };
        name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: false;
        };
        ownerParticipantId: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodUnion<[z.ZodString, z.ZodUndefined]>;
        };
        dicePieces: {
            readonly type: "record";
            readonly value: {
                readonly type: "object";
                readonly $v: 2;
                readonly $r: 1;
                readonly value: {
                    ownerCharacterId: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodUnion<[z.ZodString, z.ZodUndefined]>;
                    };
                    dice: {
                        readonly type: "record";
                        readonly value: {
                            readonly type: "object";
                            readonly $v: 1;
                            readonly $r: 1;
                            readonly value: {
                                dieType: {
                                    readonly type: "atomic";
                                    readonly mode: "replace";
                                    readonly value: z.ZodUnion<[z.ZodLiteral<"D4">, z.ZodLiteral<"D6">]>;
                                };
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
                            };
                        };
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
        imagePieces: {
            readonly type: "record";
            readonly value: {
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
        shapePieces: {
            readonly type: "record";
            readonly value: {
                readonly type: "object";
                readonly $v: 1;
                readonly $r: 1;
                readonly value: {
                    ownerParticipantId: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodUnion<[z.ZodString, z.ZodUndefined]>;
                    };
                    isPrivate: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodBoolean;
                    };
                    shapes: {
                        readonly type: "record";
                        readonly value: {
                            readonly type: "object";
                            readonly $v: 1;
                            readonly $r: 1;
                            readonly value: {
                                shape: {
                                    readonly type: "atomic";
                                    readonly mode: "replace";
                                    readonly value: z.ZodObject<{
                                        type: z.ZodLiteral<"path">;
                                        data: z.ZodString;
                                    }, "strip", z.ZodTypeAny, {
                                        type: "path";
                                        data: string;
                                    }, {
                                        type: "path";
                                        data: string;
                                    }>;
                                };
                                fill: {
                                    readonly type: "atomic";
                                    readonly mode: "replace";
                                    readonly value: z.ZodUnion<[z.ZodString, z.ZodUndefined]>;
                                };
                                stroke: {
                                    readonly type: "atomic";
                                    readonly mode: "replace";
                                    readonly value: z.ZodUnion<[z.ZodString, z.ZodUndefined]>;
                                };
                                strokeWidth: {
                                    readonly type: "atomic";
                                    readonly mode: "replace";
                                    readonly value: z.ZodUnion<[z.ZodNumber, z.ZodUndefined]>;
                                };
                            };
                        };
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
        stringPieces: {
            readonly type: "record";
            readonly value: {
                readonly type: "object";
                readonly $v: 2;
                readonly $r: 1;
                readonly value: {
                    ownerCharacterId: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodUnion<[z.ZodString, z.ZodUndefined]>;
                    };
                    isValuePrivate: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodBoolean;
                    };
                    value: {
                        readonly type: "atomic";
                        readonly mode: "ot";
                        readonly nullable: false;
                    };
                    valueInputType: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodUnion<[z.ZodUnion<[z.ZodLiteral<"String">, z.ZodLiteral<"Number">]>, z.ZodUndefined]>;
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
    };
};
//# sourceMappingURL=types.d.ts.map