import { Range } from './range';
import { FRecord } from './scriptValue/FRecord';
import { FValue } from './scriptValue/FValue';
export declare class Context {
    globalThis: FRecord;
    private varTables;
    constructor(globalThis: FRecord);
    get(name: string, range: Range | undefined): FValue;
    assign(name: string, newValue: FValue, range: Range | undefined): void;
    declare(name: string, value: FValue, type: 'let' | 'const'): void;
    scopeIn(): void;
    scopeOut(): void;
}
//# sourceMappingURL=context.d.ts.map