import { Option } from '@kizahasi/option';
import { FFunction } from '../scriptValue/FFunction';
import { FValue } from '../scriptValue/FValue';
import { GetCoreParams } from '../scriptValue/types';
declare class FSymbolClass extends FFunction {
    constructor();
    onGetting({ key }: GetCoreParams): Option<FValue>;
}
export declare const symbolClass: FSymbolClass;
export {};
//# sourceMappingURL=Symbol.d.ts.map