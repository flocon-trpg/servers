import { FObject } from './FObject';
import { FType } from './FType';
import { FValue } from './FValue';
import { AstInfo, GetCoreParams, SetCoreParams } from './types';
declare type Key = string | number | boolean | symbol | null | undefined;
export declare class FMap extends FObject {
    private readonly source;
    private readonly convertValue;
    private readonly convertValueBack;
    protected constructor(source: Map<Key, unknown>, convertValue: (value: unknown) => FValue, convertValueBack: (value: FValue, astInfo: AstInfo | undefined) => unknown);
    private static prepareInstanceMethod;
    static create(source: Map<Key, FValue>): FMap;
    private convertKeyBack;
    get type(): typeof FType.Object;
    getCore(params: GetCoreParams): FValue;
    setCore(params: SetCoreParams): void;
    iterate(): IterableIterator<FValue>;
    toPrimitiveAsString(): string;
    toPrimitiveAsNumber(): number;
    toJObject(): Map<Key, unknown>;
}
export {};
//# sourceMappingURL=FMap.d.ts.map