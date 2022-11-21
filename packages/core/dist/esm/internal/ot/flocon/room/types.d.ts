import { z } from 'zod';
export declare const dbTemplate: {
    readonly type: "object";
    readonly $v: 2;
    readonly $r: 1;
    readonly value: {
        activeBoardId: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodUnion<[z.ZodString, z.ZodUndefined]>;
        };
        bgms: {
            readonly type: "record";
            readonly value: {
                readonly type: "object";
                readonly $v: 1;
                readonly $r: 1;
                readonly value: {
                    isPaused: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodBoolean;
                    };
                    files: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodArray<z.ZodObject<{
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
                        }>, "many">;
                    };
                    volume: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodNumber;
                    };
                };
            };
        };
        boolParamNames: {
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
                };
            };
        };
        boards: {
            readonly type: "record";
            readonly value: {
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
        };
        characters: {
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
        };
        characterTag1Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: true;
        };
        characterTag2Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: true;
        };
        characterTag3Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: true;
        };
        characterTag4Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: true;
        };
        characterTag5Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: true;
        };
        characterTag6Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: true;
        };
        characterTag7Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: true;
        };
        characterTag8Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: true;
        };
        characterTag9Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: true;
        };
        characterTag10Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: true;
        };
        memos: {
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
                    dir: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodArray<z.ZodString, "many">;
                    };
                    text: {
                        readonly type: "atomic";
                        readonly mode: "ot";
                        readonly nullable: false;
                    };
                    textType: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodUnion<[z.ZodLiteral<"Plain">, z.ZodLiteral<"Markdown">]>;
                    };
                };
            };
        };
        numParamNames: {
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
                };
            };
        };
        publicChannel1Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: false;
        };
        publicChannel2Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: false;
        };
        publicChannel3Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: false;
        };
        publicChannel4Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: false;
        };
        publicChannel5Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: false;
        };
        publicChannel6Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: false;
        };
        publicChannel7Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: false;
        };
        publicChannel8Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: false;
        };
        publicChannel9Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: false;
        };
        publicChannel10Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: false;
        };
        strParamNames: {
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
                };
            };
        };
    };
};
export declare const template: {
    readonly type: "object";
    readonly $v: 2;
    readonly $r: 1;
    readonly value: {
        createdBy: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodString;
        };
        name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: false;
        };
        participants: {
            readonly type: "record";
            readonly value: {
                readonly type: "object";
                readonly $v: 2;
                readonly $r: 1;
                readonly value: {
                    name: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodUnion<[z.ZodBranded<z.ZodString, "MaxLength100String">, z.ZodUndefined]>;
                    };
                    role: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodUnion<[z.ZodUnion<[z.ZodLiteral<"Player">, z.ZodLiteral<"Spectator">, z.ZodLiteral<"Master">]>, z.ZodUndefined]>;
                    };
                };
            };
        };
        activeBoardId: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodUnion<[z.ZodString, z.ZodUndefined]>;
        };
        bgms: {
            readonly type: "record";
            readonly value: {
                readonly type: "object";
                readonly $v: 1;
                readonly $r: 1;
                readonly value: {
                    isPaused: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodBoolean;
                    };
                    files: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodArray<z.ZodObject<{
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
                        }>, "many">;
                    };
                    volume: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodNumber;
                    };
                };
            };
        };
        boolParamNames: {
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
                };
            };
        };
        boards: {
            readonly type: "record";
            readonly value: {
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
        };
        characters: {
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
        };
        characterTag1Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: true;
        };
        characterTag2Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: true;
        };
        characterTag3Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: true;
        };
        characterTag4Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: true;
        };
        characterTag5Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: true;
        };
        characterTag6Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: true;
        };
        characterTag7Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: true;
        };
        characterTag8Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: true;
        };
        characterTag9Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: true;
        };
        characterTag10Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: true;
        };
        memos: {
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
                    dir: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodArray<z.ZodString, "many">;
                    };
                    text: {
                        readonly type: "atomic";
                        readonly mode: "ot";
                        readonly nullable: false;
                    };
                    textType: {
                        readonly type: "atomic";
                        readonly mode: "replace";
                        readonly value: z.ZodUnion<[z.ZodLiteral<"Plain">, z.ZodLiteral<"Markdown">]>;
                    };
                };
            };
        };
        numParamNames: {
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
                };
            };
        };
        publicChannel1Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: false;
        };
        publicChannel2Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: false;
        };
        publicChannel3Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: false;
        };
        publicChannel4Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: false;
        };
        publicChannel5Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: false;
        };
        publicChannel6Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: false;
        };
        publicChannel7Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: false;
        };
        publicChannel8Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: false;
        };
        publicChannel9Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: false;
        };
        publicChannel10Name: {
            readonly type: "atomic";
            readonly mode: "ot";
            readonly nullable: false;
        };
        strParamNames: {
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
                };
            };
        };
    };
};
//# sourceMappingURL=types.d.ts.map