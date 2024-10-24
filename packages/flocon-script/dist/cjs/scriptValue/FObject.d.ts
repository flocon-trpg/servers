import { FType } from './FType';
import { FValue } from './FValue';
import { FObjectBase, GetCoreParams, GetParams, SetCoreParams, SetParams } from './types';
export declare abstract class FObject implements FObjectBase {
    protected abstract getCore(params: GetCoreParams): FValue;
    get({ property, astInfo }: GetParams): FValue;
    protected abstract setCore(params: SetCoreParams): void;
    set({ property, newValue, astInfo }: SetParams): void;
    get type(): typeof FType.Object;
    toPrimitiveAsString(): string;
    toPrimitiveAsNumber(): number;
    abstract toJObject(): unknown;
}
//# sourceMappingURL=FObject.d.ts.map