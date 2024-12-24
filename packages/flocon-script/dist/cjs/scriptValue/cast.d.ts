import { FArray } from './FArray';
import { FObject } from './FObject';
import { FValue } from './FValue';
import { AstInfo } from './types';
declare class JObjectCaster<T = never> {
    private readonly source;
    private readonly addedTypes;
    private readonly successfullyCastedValue;
    private readonly astInfo;
    private constructor();
    static begin(source: FValue, astInfo: AstInfo | undefined): JObjectCaster<never>;
    cast(): T;
    addArray(): JObjectCaster<T | FArray>;
    addBoolean(): JObjectCaster<T | boolean>;
    addFunction(): JObjectCaster<T | ((isNew: boolean) => (args: FValue[]) => FValue)>;
    addNull(): JObjectCaster<T | null>;
    addNumber(): JObjectCaster<T | number>;
    addObject(): JObjectCaster<T | FObject>;
    addString(): JObjectCaster<T | string>;
    addSymbol(): JObjectCaster<T | symbol>;
    addUndefined(): JObjectCaster<T | undefined>;
}
export declare const beginCast: (source: FValue, astInfo: AstInfo | undefined) => JObjectCaster<never>;
export {};
//# sourceMappingURL=cast.d.ts.map