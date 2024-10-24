import { FObject } from './FObject';
import { FValue } from './FValue';
import { GetCoreParams, SetCoreParams } from './types';
export declare class FRecord extends FObject {
    readonly source: Map<string, FValue>;
    constructor(base?: FRecord);
    protected getCore({ key, astInfo }: GetCoreParams): FValue;
    protected setCore({ key, newValue, astInfo }: SetCoreParams): void;
    clone(): FRecord;
    forEach(callbackfn: (value: FValue, key: string) => void): void;
    toJObject(): unknown;
}
//# sourceMappingURL=FRecord.d.ts.map