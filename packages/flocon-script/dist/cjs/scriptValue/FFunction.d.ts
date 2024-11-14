import { Option } from '@kizahasi/option';
import { FType } from './FType';
import { FValue } from './FValue';
import { AstInfo, FObjectBase, GetCoreParams, GetParams, SetParams } from './types';
type FFunctionParams = {
    args: FValue[];
    isNew: boolean;
    astInfo: AstInfo | undefined;
};
export declare class FFunction implements FObjectBase {
    private readonly func;
    constructor(func: (params: FFunctionParams) => FValue);
    get type(): typeof FType.Function;
    exec(params: FFunctionParams): FValue;
    protected onGetting(params: GetCoreParams): Option<FValue>;
    get({ property, astInfo }: GetParams): FValue;
    set({ astInfo }: SetParams): void;
    toPrimitiveAsString(): string;
    toPrimitiveAsNumber(): number;
    toJObject(): Function;
}
export {};
//# sourceMappingURL=FFunction.d.ts.map