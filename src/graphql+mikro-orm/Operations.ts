import { createUnionType, Field, InputType, ObjectType } from 'type-graphql';
import { FileSourceType } from '../enums/FileSourceType';
import { FilePath as GraphQLFilePath } from './entities/filePath/graphql';
import { FilePath as GlobalFilePath } from './entities/filePath/global';
import { TextDownOperation as TextDownOperationCore, TextUpOperation as TextUpOperationCore, TextTwoWayOperation as TextTwoWayOperationCore, ApplyError, PositiveInt, ComposeAndTransformError, retain, insert$, delete$, NonEmptyString, TextUpOperation } from '../@shared/textOperation';
import { CustomResult, ResultModule } from '../@shared/Result';
import { __ } from '../@shared/collection';
import { undefinedForAll } from '../utils/helpers';

/* validateメソッドは、mikro-ormでJSONとして保存された値をチェックするために使われる。
 * 通常は型は常に正しいが、Entityのコードに変更があったり（おそらくマイグレーションも不可）、管理者がDBを直接いじったりしたときに型が異なるおそれがある。それに備えた対策。
 */

const validateFilePath = (source: GlobalFilePath): void => {
    if (typeof source.path !== 'string') {
        throw 'FilePath.path is not string.';
    }
    // https://stackoverflow.com/questions/43804805/check-if-value-exists-in-enum-in-typescript/47755096#47755096
    if (!Object.values(FileSourceType).includes(source.sourceType)) {
        throw 'FilePath.sourceType is not FileSourceType.';
    }
};

const validateFilePathArray = (source: GlobalFilePath[]): void => {
    if (!Array.isArray(source)) {
        throw 'source is not Array';
    }
};

type TransformParameters<T> = {
    first: { oldValue: T; newValue: T } | undefined;
    second: { newValue: T } | undefined;
    prevState: T;
}
type NullableTransformParameters<T> = {
    first: { oldValue: T | undefined; newValue: T | undefined } | undefined;
    second: { newValue: T | undefined } | undefined;
    prevState: T | undefined;
}
type TransformResult<T> = { oldValue: T; newValue: T } | undefined;
type NullableTransformResult<T> = { oldValue: T | undefined; newValue: T | undefined } | undefined;

type ToGraphQLOperationParameters<T> = {
    valueOperation?: {
        oldValue: T;
        newValue: T;
    };
    isValuePrivateOpeartion?: {
        oldValue: boolean;
        newValue: boolean;
    };
}
type ToGraphQLOperationNullableParameters<T> = {
    valueOperation?: {
        oldValue: T | undefined;
        newValue: T | undefined;
    };
    isValuePrivateOpeartion?: {
        oldValue: boolean;
        newValue: boolean;
    };
}

const ReplaceValueOperationModule = {
    compose<T>(first: { oldValue: T } | undefined, second: { oldValue: T } | undefined): { oldValue: T } | undefined {
        if (first === undefined) {
            return second;
        }
        if (second === undefined) {
            return first;
        }
        return { oldValue: first.oldValue };
    },
    transform<T>({ first, second, prevState }: TransformParameters<T>): TransformResult<T> {
        if (first === undefined && second !== undefined) {
            const newOperation = { oldValue: prevState, newValue: second.newValue };
            if (newOperation.oldValue !== newOperation.newValue) {
                return { oldValue: prevState, newValue: second.newValue };
            }
        }
        return undefined;
    },
    toGraphQLOperation<T>({
        valueOperation,
        isValuePrivateOperation,
        defaultValue,
    }: {
        valueOperation?: {
            oldValue: T;
            newValue: T;
        };
        isValuePrivateOperation?: {
            oldValue: boolean;
            newValue: boolean;
        };
        defaultValue: T;
    }): { oldValue: T; newValue: T } | undefined {
        if (valueOperation === undefined) {
            return undefined;
        }
        if (!isValuePrivateOperation) {
            return valueOperation;
        }
        if (isValuePrivateOperation.oldValue) {
            if (isValuePrivateOperation.newValue) {
                return undefined;
            }
            return { oldValue: defaultValue, newValue: valueOperation.newValue };
        } if (isValuePrivateOperation.newValue) {
            return { oldValue: valueOperation.oldValue, newValue: defaultValue };
        }
        return valueOperation;
    },
};

const ReplaceNullableValueOperationModule = {
    compose<T>(first: { oldValue: T | undefined } | undefined, second: { oldValue: T | undefined } | undefined): { oldValue: T | undefined } | undefined {
        if (first === undefined) {
            return second;
        }
        if (second === undefined) {
            return first;
        }
        return { oldValue: first.oldValue };
    },
    transform<T>({ first, second, prevState }: NullableTransformParameters<T>): NullableTransformResult<T> {
        if (first === undefined && second !== undefined) {
            const newOperation = { oldValue: prevState, newValue: second.newValue };
            if (newOperation.oldValue !== newOperation.newValue) {
                return { oldValue: prevState, newValue: second.newValue };
            }
        }
        return undefined;
    },
    toGraphQLOperation<T>({
        valueOperation,
        isValuePrivateOperation,
    }: {
        valueOperation?: {
            oldValue: T | undefined;
            newValue: T | undefined;
        };
        isValuePrivateOperation?: {
            oldValue: boolean;
            newValue: boolean;
        };
    }): { oldValue?: T; newValue?: T } | undefined {
        if (valueOperation === undefined) {
            return undefined;
        }
        if (!isValuePrivateOperation) {
            return valueOperation;
        }
        if (isValuePrivateOperation.oldValue) {
            if (isValuePrivateOperation.newValue) {
                return undefined;
            }
            return { newValue: valueOperation.newValue };
        } if (isValuePrivateOperation.newValue) {
            return { oldValue: valueOperation.oldValue };
        }
        return valueOperation;
    },
};

@ObjectType()
@InputType('ReplaceBooleanUpOperationInput')
export class ReplaceBooleanUpOperation {
    @Field()
    public newValue!: boolean;
}

export type ReplaceBooleanDownOperation = {
    oldValue: boolean;
}

export const ReplaceBooleanDownOperationModule = {
    compose: (first: ReplaceBooleanDownOperation | undefined, second: ReplaceBooleanDownOperation | undefined): ReplaceBooleanDownOperation | undefined => ReplaceValueOperationModule.compose(first, second)
};

export type ReplaceBooleanTwoWayOperation = {
    oldValue: boolean;
    newValue: boolean;
}

export const ReplaceBooleanTwoWayOperationModule = {
    transform: (params: TransformParameters<boolean>): TransformResult<boolean> => ReplaceValueOperationModule.transform(params),
    toGraphQLOperation: (params: ToGraphQLOperationParameters<boolean>) => ReplaceValueOperationModule.toGraphQLOperation({ ...params, defaultValue: false }),
};


@ObjectType()
@InputType('ReplaceFilePathArrayUpOperationInput')
export class ReplaceFilePathArrayUpOperation {
    @Field(() => [GraphQLFilePath])
    public newValue!: GraphQLFilePath[];
}

export type ReplaceFilePathArrayDownOperation = {
    oldValue: GlobalFilePath[];
}

export const ReplaceFilePathArrayDownOperationModule = {
    validate: (source: { oldValue: GlobalFilePath[] } | undefined): { oldValue: GlobalFilePath[] } | undefined => {
        if (source === undefined) {
            return undefined;
        }
        validateFilePathArray(source.oldValue);
        return source;
    },
    compose: (first: ReplaceFilePathArrayDownOperation | undefined, second: ReplaceFilePathArrayDownOperation | undefined): ReplaceFilePathArrayDownOperation | undefined => {
        const result = ReplaceValueOperationModule.compose(first, second);
        if (result === undefined) {
            return undefined;
        }
        return {
            oldValue: [...result.oldValue],
        };
    }
};

export type ReplaceFilePathArrayTwoWayOperation = {
    oldValue: GlobalFilePath[];
    newValue: GlobalFilePath[];
}

export const ReplaceFilePathArrayTwoWayOperationModule = {
    transform: (params: TransformParameters<GlobalFilePath[]>): TransformResult<GlobalFilePath[]> => {
        const result = ReplaceValueOperationModule.transform(params);
        if (result === undefined) {
            return result;
        }
        return { oldValue: [...result.oldValue], newValue: [...result.newValue] };
    },
    toGraphQLOperation: (params: ToGraphQLOperationParameters<GlobalFilePath[]>) => {
        const result = ReplaceValueOperationModule.toGraphQLOperation({ ...params, defaultValue: [] });
        if (result === undefined) {
            return result;
        }
        return { oldValue: [...result.oldValue], newValue: [...result.newValue] };
    },
};


@ObjectType()
@InputType('ReplaceFilePathUpOperationInput')
export class ReplaceFilePathUpOperation {
    @Field(() => GraphQLFilePath)
    public newValue!: GraphQLFilePath;
}

export type ReplaceFilePathDownOperation = {
    oldValue: GlobalFilePath;
}

export const ReplaceFilePathDownOperationModule = {
    validate: (source: { oldValue: GlobalFilePath } | undefined): { oldValue: GlobalFilePath } | undefined => {
        if (source === undefined) {
            return undefined;
        }
        validateFilePath(source.oldValue);
        return source;
    },
    compose: (first: ReplaceFilePathDownOperation | undefined, second: ReplaceFilePathDownOperation | undefined): ReplaceFilePathDownOperation | undefined => ReplaceValueOperationModule.compose(first, second)
};

export type ReplaceFilePathTwoWayOperation = {
    oldValue: GlobalFilePath;
    newValue: GlobalFilePath;
}

export const ReplaceFilePathTwoWayOperationModule = {
    transform: (params: TransformParameters<GlobalFilePath>): TransformResult<GlobalFilePath> => ReplaceValueOperationModule.transform(params),
    toGraphQLOperation: (params: ToGraphQLOperationNullableParameters<GlobalFilePath>) => {
        const result = ReplaceNullableValueOperationModule.toGraphQLOperation(params);
        if (result === undefined) {
            return result;
        }
        return {
            oldValue: { ...result.oldValue },
            newValue: { ...result.newValue },
        };
    },
};


@ObjectType()
@InputType('ReplaceNullableBooleanUpOperationInput')
export class ReplaceNullableBooleanUpOperation {
    @Field({ nullable: true })
    public newValue?: boolean;
}

export type ReplaceNullableBooleanDownOperation = {
    oldValue: boolean | null | undefined;
}

export const ReplaceNullableBooleanDownOperationModule = {
    validate: (source: { oldValue: boolean | null | undefined } | null | undefined): { oldValue: boolean | undefined } | undefined => {
        if (source == null) {
            return undefined;
        }
        if (source.oldValue == null) {
            return undefined;
        }
        if (typeof source.oldValue !== 'boolean') {
            throw 'source.oldValue is not boolean';
        }
        return { oldValue: source.oldValue ?? undefined };
    },
    compose: (first: ReplaceNullableBooleanDownOperation | undefined, second: ReplaceNullableBooleanDownOperation | undefined): ReplaceNullableBooleanDownOperation | undefined => ReplaceNullableValueOperationModule.compose(first, second)
};

export type ReplaceNullableBooleanTwoWayOperation = {
    oldValue: boolean | undefined;
    newValue: boolean | undefined;
}

export const ReplaceNullableBooleanTwoWayOperationModule = {
    transform: (params: NullableTransformParameters<boolean>): NullableTransformResult<boolean> => ReplaceNullableValueOperationModule.transform(params),
    toGraphQLOperation: (params: ToGraphQLOperationNullableParameters<boolean>) => ReplaceNullableValueOperationModule.toGraphQLOperation(params),
};


@ObjectType()
@InputType('ReplaceNullableFilePathUpOperationInput')
export class ReplaceNullableFilePathUpOperation {
    @Field({ nullable: true })
    public newValue?: GraphQLFilePath;
}

export type ReplaceNullableFilePathDownOperation = {
    oldValue: GlobalFilePath | null | undefined;
}

export const ReplaceNullableFilePathDownOperationModule = {
    validate: (source: { oldValue: GlobalFilePath | null | undefined } | null | undefined): { oldValue: GlobalFilePath | undefined } | undefined => {
        if (source == null) {
            return undefined;
        }
        if (source.oldValue == null) {
            return undefined;
        }
        validateFilePath(source.oldValue);
        return { oldValue: source.oldValue ?? undefined };
    },
    create: (setPath: string | undefined, setSourceType: FileSourceType | undefined, useSet: boolean): { oldValue: GlobalFilePath | undefined } | undefined => {
        if (setPath !== undefined && setSourceType !== undefined) {
            return { oldValue: { path: setPath, sourceType: setSourceType } };
        }
        if (useSet) {
            return { oldValue: undefined };
        }
        return undefined;
    },
    compose: (first: ReplaceNullableFilePathDownOperation | undefined, second: ReplaceNullableFilePathDownOperation | undefined): ReplaceNullableFilePathDownOperation | undefined => ReplaceNullableValueOperationModule.compose(first, second)
};

export type ReplaceNullableFilePathTwoWayOperation = {
    oldValue: GlobalFilePath | undefined;
    newValue: GlobalFilePath | undefined;
}

export const ReplaceNullableFilePathTwoWayOperationModule = {
    transform: (params: NullableTransformParameters<GlobalFilePath>): NullableTransformResult<GlobalFilePath> => ReplaceNullableValueOperationModule.transform(params),
    toGraphQLOperation: (params: ToGraphQLOperationNullableParameters<GlobalFilePath>) => ReplaceNullableValueOperationModule.toGraphQLOperation(params),
};


@ObjectType()
@InputType('ReplaceNullableNumberUpOperationInput')
export class ReplaceNullableNumberUpOperation {
    @Field({ nullable: true })
    public newValue?: number;
}

export type ReplaceNullableNumberDownOperation = {
    oldValue: number | null | undefined;
}

export const ReplaceNullableNumberDownOperationModule = {
    validate: (source: { oldValue: number | null | undefined } | null | undefined): { oldValue: number | undefined } | undefined => {
        if (source == null) {
            return undefined;
        }
        if (source.oldValue == null) {
            return undefined;
        }
        if (typeof source.oldValue !== 'number') {
            throw 'source.oldValue is not number';
        }
        return { oldValue: source.oldValue ?? undefined };
    },
    compose: (first: ReplaceNullableNumberDownOperation | undefined, second: ReplaceNullableNumberDownOperation | undefined): ReplaceNullableNumberDownOperation | undefined => ReplaceNullableValueOperationModule.compose(first, second)
};

export type ReplaceNullableNumberTwoWayOperation = {
    oldValue: number | undefined;
    newValue: number | undefined;
}

export const ReplaceNullableNumberTwoWayOperationModule = {
    transform: (params: NullableTransformParameters<number>): NullableTransformResult<number> => ReplaceNullableValueOperationModule.transform(params),
    toGraphQLOperation: (params: ToGraphQLOperationNullableParameters<number>) => ReplaceNullableValueOperationModule.toGraphQLOperation(params),
};


@ObjectType()
@InputType('ReplaceNullableStringUpOperationInput')
export class ReplaceNullableStringUpOperation {
    @Field({ nullable: true })
    public newValue?: string;
}

export type ReplaceNullableStringDownOperation = {
    oldValue: string | null | undefined;
}

export const ReplaceNullableStringDownOperationModule = {
    validate: (source: { oldValue: string | null | undefined } | null | undefined): { oldValue: string | undefined } | undefined => {
        if (source == null) {
            return undefined;
        }
        if (source.oldValue == null) {
            return undefined;
        }
        if (typeof source.oldValue !== 'string') {
            throw 'source.oldValue is not string';
        }
        return { oldValue: source.oldValue ?? undefined };
    },
    compose: (first: ReplaceNullableStringDownOperation | undefined, second: ReplaceNullableStringDownOperation | undefined): ReplaceNullableStringDownOperation | undefined => ReplaceNullableValueOperationModule.compose(first, second)
};

export type ReplaceNullableStringTwoWayOperation = {
    oldValue: string | undefined;
    newValue: string | undefined;
}

export const ReplaceNullableStringTwoWayOperationModule = {
    transform: (params: NullableTransformParameters<string>): NullableTransformResult<string> => ReplaceNullableValueOperationModule.transform(params),
    toGraphQLOperation: (params: ToGraphQLOperationNullableParameters<string>) => ReplaceNullableValueOperationModule.toGraphQLOperation(params),
};


@ObjectType()
@InputType('ReplaceNumberUpOperationInput')
export class ReplaceNumberUpOperation {
    @Field()
    public newValue!: number;
}

export type ReplaceNumberDownOperation = {
    oldValue: number;
}

export const ReplaceNumberDownOperationModule = {
    create: (set: number | undefined): { oldValue: number } | undefined => {
        return set === undefined ? undefined : { oldValue: set };
    },
    compose: (first: ReplaceNumberDownOperation | undefined, second: ReplaceNumberDownOperation | undefined): ReplaceNumberDownOperation | undefined => ReplaceValueOperationModule.compose(first, second)
};

export type ReplaceNumberTwoWayOperation = {
    oldValue: number;
    newValue: number;
}

export const ReplaceNumberTwoWayOperationModule = {
    transform: (params: TransformParameters<number>): TransformResult<number> => ReplaceValueOperationModule.transform(params),
    toGraphQLOperation: (params: ToGraphQLOperationParameters<number>) => ReplaceValueOperationModule.toGraphQLOperation({ ...params, defaultValue: 0 }),
};


@ObjectType()
@InputType('ReplaceStringUpOperationInput')
export class ReplaceStringUpOperation {
    @Field()
    public newValue!: string;
}

export type ReplaceStringDownOperation = {
    oldValue: string;
}

export const ReplaceStringDownOperationModule = {
    create: (set: string | undefined): { oldValue: string } | undefined => {
        return set === undefined ? undefined : { oldValue: set };
    },
    compose: (first: ReplaceStringDownOperation | undefined, second: ReplaceStringDownOperation | undefined): ReplaceStringDownOperation | undefined => ReplaceValueOperationModule.compose(first, second)
};

export type ReplaceStringTwoWayOperation = {
    oldValue: string;
    newValue: string;
}

export const ReplaceStringTwoWayOperationModule = {
    transform: (params: TransformParameters<string>): TransformResult<string> => ReplaceValueOperationModule.transform(params),
    toGraphQLOperation: (params: ToGraphQLOperationParameters<string>) => ReplaceValueOperationModule.toGraphQLOperation({ ...params, defaultValue: '' }),
};

// TextOperationの表現は、mikro-ormではTextDownOperationUnit[]、GraphQLではTextUpOperationUnit[] を用いる。

// TextUpOperationUnitとTextDownOperationUnitに関して: retain, insert, deleteのうち1つがnon-nullishで、残りはnullishでなければならない。また、numberはPositiveIntで、stringはNonEmptyStringでなければならない。

// Inputはunionをサポートしていないため、unionではない形で定義している。Objectはunionに対応しているが、型を統一するほうが便利だと考えてObjectもunionではない形にしている。
@ObjectType()
@InputType('TextUpOperationUnitInput')
export class TextUpOperationUnit {
    @Field({ nullable: true })
    public retain?: number;

    @Field({ nullable: true })
    public insert?: string;

    @Field({ nullable: true })
    public delete?: number;
}

export type TextDownOperationUnit = {
    retain?: number;
    insert?: number;
    delete?: string;
}

export type TextTwoWayOperationUnit = {
    retain?: number;
    insert?: string;
    delete?: string;
}

export type TextUpOperation = TextUpOperationCore.Operation;
export type TextDownOperation = TextDownOperationCore.Operation;
export type TextTwoWayOperation = TextTwoWayOperationCore.Operation;

export const TextUpOperationModule = {
    ofUnit: (source: ReadonlyArray<TextUpOperationUnit> | null | undefined): TextUpOperation | undefined => {
        if (source == null) {
            return undefined;
        }

        const unit = __(source).compact(unit => {
            // TextDownOperationUnit のインスタンスが制約を守っていなくても、処理は続行される。

            if (unit.delete !== undefined) {
                return {
                    type: delete$,
                    delete: unit.delete,
                } as const;
            }
            if (unit.insert !== undefined) {
                return {
                    type: insert$,
                    insert: unit.insert,
                } as const;
            }
            if (unit.retain !== undefined) {
                return {
                    type: retain,
                    retain: unit.retain,
                } as const;
            }
            return null;
        }).toArray();

        return TextUpOperationCore.ofUnit(unit);
    },
};

export const TextDownOperationModule = {
    // もしsourceの型が ReadonlyArray<OperationUnit> | null | undefined ではない場合でも正常に処理され、undefinedが返される。
    ofUnitAndValidate: (source: ReadonlyArray<TextDownOperationUnit> | null | undefined): TextDownOperation | undefined => {
        if (source == null) {
            return undefined;
        }
        if (!Array.isArray(source)) {
            return undefined;
        }

        const unit = __(source).compact(unit => {
            // TextDownOperationUnit のインスタンスが制約を守っていなくても、処理は続行される。

            if (unit.delete !== undefined) {
                return {
                    type: delete$,
                    delete: unit.delete,
                } as const;
            }
            if (unit.insert !== undefined) {
                return {
                    type: insert$,
                    insert: unit.insert,
                } as const;
            }
            if (unit.retain !== undefined) {
                return {
                    type: retain,
                    retain: unit.retain,
                } as const;
            }
            return null;
        }).toArray();

        return TextDownOperationCore.ofUnit(unit);
    },
    applyBack: (nextState: string, action: TextDownOperation) => {
        return TextDownOperationCore.applyBack({ nextState, action });
    },
    applyBackAndRestore: (nextState: string, action: TextDownOperation) => {
        return TextDownOperationCore.applyBackAndRestore({ nextState, action });
    },
    compose: (first: TextDownOperation | undefined, second: TextDownOperation | undefined): TextDownOperation | undefined => {
        if (first === undefined) {
            return second;
        }
        if (second === undefined) {
            return first;
        }
        const result = TextDownOperationCore.compose({ first, second });
        if (result.isError) {
            throw result.error;
        }
        return result.value;
    },
    diff: (prev: string, next: string) => {
        return TextDownOperationCore.diff({first: prev, second: next});
    }
};

export const TextTwoWayOperationModule = {
    apply: (prevState: string, operation: TextTwoWayOperation) => {
        return TextUpOperationCore.apply({ prevState, action: TextTwoWayOperationCore.toUpOperation(operation) });
    },
    toUpUnit: (source: TextTwoWayOperation): TextUpOperationUnit[] => {
        const upOperation = TextTwoWayOperationCore.toUpOperation(source);
        return TextUpOperationCore.toUnit(upOperation).map(unit => {
            switch (unit.type) {
                case retain:
                    return { retain: unit.retain };
                case insert$:
                    return { insert: unit.insert };
                case delete$:
                    return { delete: unit.delete };
            }
        });
    },
    toDownUnit: (source: TextTwoWayOperation): TextDownOperationUnit[] => {
        const downOperation = TextTwoWayOperationCore.toDownOperation(source);
        return TextDownOperationCore.toUnit(downOperation).map(unit => {
            switch (unit.type) {
                case retain:
                    return { retain: unit.retain };
                case insert$:
                    return { insert: unit.insert };
                case delete$:
                    return { delete: unit.delete };
            }
        });
    },
    toFullUnit: (source: TextTwoWayOperation): TextTwoWayOperationUnit[] => {
        return TextTwoWayOperationCore.toUnit(source).map(unit => {
            switch (unit.type) {
                case retain:
                    return { retain: unit.retain };
                case insert$:
                    return { insert: unit.insert };
                case delete$:
                    return { delete: unit.delete };
            }
        });
    },
    transform: ({
        first,
        second,
        prevState,
    }: {
        first?: TextTwoWayOperation;
        second?: TextUpOperation;
        prevState: string;
    }): CustomResult<{ firstPrime?: TextTwoWayOperation; secondPrime?: TextTwoWayOperation }, ApplyError<PositiveInt> | ComposeAndTransformError> => {
        if (first === undefined) {
            if (second === undefined) {
                return ResultModule.ok({});
            }
            const restoreResult = TextUpOperation.applyAndRestore({ prevState, action: second });
            if (restoreResult.isError) {
                return restoreResult;
            }
            return ResultModule.ok({ secondPrime: restoreResult.value.restored });
        }
        if (second === undefined) {
            return ResultModule.ok({ firstPrime: first });
        }
        const secondResult = TextUpOperationCore.applyAndRestore({ prevState, action: second });
        if (secondResult.isError) {
            return secondResult;
        }
        return TextTwoWayOperationCore.transform({ first, second: secondResult.value.restored });
    },
    // Make sure this:
    // - apply(valueOperation.oldValue, valueOperation.operation.up) = valueOperation.newValue
    toGraphQLOperation({
        valueOperation,
        isValuePrivateOperation,
    }: {
        valueOperation?: {
            oldValue: string;
            newValue: string;
            operation?: TextTwoWayOperation;
        };
        isValuePrivateOperation?: {
            oldValue: boolean;
            newValue: boolean;
        };
    }): TextTwoWayOperation | undefined {
        if (valueOperation === undefined || valueOperation.operation === undefined) {
            return undefined;
        }
        if (!isValuePrivateOperation) {
            return valueOperation.operation;
        }
        if (isValuePrivateOperation.oldValue) {
            if (isValuePrivateOperation.newValue) {
                return undefined;
            }
            const del = NonEmptyString.tryCreate(valueOperation.oldValue);
            if (del === undefined) {
                return undefined;
            }
            return {
                headEdit: {
                    type: delete$,
                    delete: del,
                },
                body: [],
            };
        } if (isValuePrivateOperation.newValue) {
            const ins = NonEmptyString.tryCreate(valueOperation.newValue);
            if (ins === undefined) {
                return undefined;
            }
            return {
                headEdit: {
                    type: insert$,
                    insert: ins,
                },
                body: [],
            };
        }
        return valueOperation.operation;
    },
};