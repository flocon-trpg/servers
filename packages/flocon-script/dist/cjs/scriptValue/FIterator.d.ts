import { FObject } from './FObject';
import { FType } from './FType';
import { FValue } from './FValue';
import { GetCoreParams, SetCoreParams } from './types';
export declare class FIterator extends FObject {
    private readonly source;
    private readonly convertValue;
    protected constructor(source: IterableIterator<unknown>, convertValue: (value: unknown) => FValue);
    private static prepareInstanceMethod;
    static create(source: IterableIterator<FValue>): FIterator;
    get type(): typeof FType.Object;
    getCore(params: GetCoreParams): FValue;
    setCore(params: SetCoreParams): void;
    iterate(): IterableIterator<FValue>;
    toPrimitiveAsString(): string;
    toPrimitiveAsNumber(): number;
    toJObject(): IterableIterator<unknown>;
}
//# sourceMappingURL=FIterator.d.ts.map