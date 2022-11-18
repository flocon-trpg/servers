import { Option } from '@kizahasi/option';
import { FFunction } from '../scriptValue/FFunction';
import { FValue } from '../scriptValue/FValue';
import { GetCoreParams } from '../scriptValue/types';
declare class FConsoleClass extends FFunction {
    private readonly header;
    constructor(header: string);
    private static prepareStaticMethod;
    onGetting({ key, astInfo }: GetCoreParams): Option<FValue>;
}
export declare const createConsoleClass: (header: string) => FConsoleClass;
export {};
//# sourceMappingURL=console.d.ts.map