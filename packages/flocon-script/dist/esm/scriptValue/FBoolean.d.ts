import { FType } from './FType';
import { FValue } from './FValue';
import { FObjectBase, GetParams, SetParams } from './types';
export declare class FBoolean implements FObjectBase {
    readonly raw: boolean;
    constructor(raw: boolean);
    private static prepareInstanceMethod;
    get type(): typeof FType.Boolean;
    get({ property, astInfo }: GetParams): FValue;
    set({ astInfo }: SetParams): void;
    toPrimitiveAsString(): string;
    toPrimitiveAsNumber(): number;
    toJObject(): boolean;
}
//# sourceMappingURL=FBoolean.d.ts.map