import { Option } from '@kizahasi/option';
import { FFunction } from '../scriptValue/FFunction';
import { FValue } from '../scriptValue/FValue';
import { GetCoreParams } from '../scriptValue/types';
declare class FArrayClass extends FFunction {
    constructor();
    private static prepareStaticMethod;
    onGetting({ key, astInfo }: GetCoreParams): Option<FValue>;
}
export declare const arrayClass: FArrayClass;
export {};
//# sourceMappingURL=Array.d.ts.map