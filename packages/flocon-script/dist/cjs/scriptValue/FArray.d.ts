import { FType } from './FType';
import { FValue } from './FValue';
import { AstInfo, FObjectBase, GetParams, SetParams } from './types';
export declare class FArray implements FObjectBase {
    private readonly source;
    private readonly convert;
    private readonly convertBack;
    protected constructor(source: unknown[], convert: (value: unknown) => FValue, convertBack: (value: FValue, astInfo: AstInfo | undefined) => unknown);
    private static prepareInstanceMethod;
    static create(source: FValue[]): FArray;
    get type(): typeof FType.Array;
    toJArray(): FValue[];
    iterate(): IterableIterator<FValue>;
    private static isValidIndex;
    get({ property, astInfo }: GetParams): FValue;
    set({ property, newValue, astInfo }: SetParams): void;
    toPrimitiveAsString(): string;
    toPrimitiveAsNumber(): number;
    toJObject(): unknown[];
}
export declare class FTypedArray<T> extends FArray {
    constructor(source: T[], convert: (value: T) => FValue, convertBack: (value: FValue, astInfo: AstInfo | undefined) => T);
}
//# sourceMappingURL=FArray.d.ts.map