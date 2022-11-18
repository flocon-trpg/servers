import { FType } from './FType';
import { FValue } from './FValue';
import { FObjectBase, GetParams, SetParams } from './types';
export declare class FString implements FObjectBase {
    readonly raw: string;
    constructor(raw: string);
    private static prepareInstanceMethod;
    get type(): typeof FType.String;
    get({ property, astInfo }: GetParams): FValue;
    set({ astInfo }: SetParams): void;
    iterate(): IterableIterator<FValue>;
    toPrimitiveAsString(): string;
    toPrimitiveAsNumber(): number;
    toPrimitiveAsDefault(): string;
    toJObject(): string;
}
//# sourceMappingURL=FString.d.ts.map