import { FObject } from './FObject';
import { FType } from './FType';
import { FValue } from './FValue';
import { AstInfo, GetCoreParams, SetCoreParams } from './types';
export declare class FRecordRef<TValue> extends FObject {
    readonly source: Record<string, TValue>;
    protected readonly convertValue: (value: TValue) => FValue;
    protected readonly convertValueBack: (value: FValue, astInfo: AstInfo | undefined) => TValue;
    constructor(source: Record<string, TValue>, convertValue: (value: TValue) => FValue, convertValueBack: (value: FValue, astInfo: AstInfo | undefined) => TValue);
    protected prepareInstanceMethod(isNew: boolean, astInfo: AstInfo | undefined): void;
    protected convertKeyBack(source: FValue, astInfo: AstInfo | undefined): string;
    protected validateKey(key: string): void;
    get type(): typeof FType.Object;
    getCore(params: GetCoreParams): FValue;
    setCore(params: SetCoreParams): void;
    toPrimitiveAsString(): string;
    toPrimitiveAsNumber(): number;
    toJObject(): Record<string, TValue>;
    equals(other: FValue): boolean;
}
//# sourceMappingURL=FRecordRef.d.ts.map