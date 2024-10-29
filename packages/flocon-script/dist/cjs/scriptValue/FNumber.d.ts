import { FType } from './FType';
import { FValue } from './FValue';
import { FObjectBase, GetParams, SetParams } from './types';
export declare class FNumber implements FObjectBase {
    readonly raw: number;
    constructor(raw: number);
    private static prepareInstanceMethod;
    get type(): typeof FType.Number;
    get({ property, astInfo }: GetParams): FValue;
    set({ astInfo }: SetParams): void;
    toPrimitiveAsString(): string;
    toPrimitiveAsNumber(): number;
    toJObject(): number;
}
//# sourceMappingURL=FNumber.d.ts.map