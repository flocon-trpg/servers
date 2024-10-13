import { FRecord } from './FRecord';
import { FValue } from './FValue';
import { GetCoreParams, SetCoreParams } from './types';
export declare class FGlobalRecord extends FRecord {
    constructor(base?: FRecord);
    protected getCore(params: GetCoreParams): FValue;
    protected setCore({ key, newValue, astInfo }: SetCoreParams): void;
}
//# sourceMappingURL=FGlobalRecord.d.ts.map