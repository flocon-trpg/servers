import { FType } from './FType';
import { FValue } from './FValue';
import { FObjectBase, GetParams, SetParams } from './types';
export declare class FSymbol implements FObjectBase {
    readonly raw: symbol;
    constructor(raw: symbol);
    private static prepareInstanceMethod;
    get type(): typeof FType.Symbol;
    get({ property, astInfo }: GetParams): FValue;
    set({ astInfo }: SetParams): void;
    toPrimitiveAsString(): string;
    toPrimitiveAsNumber(): number;
    toJObject(): symbol;
}
//# sourceMappingURL=FSymbol.d.ts.map