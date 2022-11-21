import { Range } from '../range';
import { FValue } from './FValue';
export declare type AstInfo = {
    range?: Range;
};
export declare type GetParams = {
    property: FValue;
    astInfo?: AstInfo;
};
export declare type SetParams = {
    property: FValue;
    newValue: FValue;
    astInfo?: AstInfo;
};
export declare type GetCoreParams = {
    key: string | number | symbol;
    astInfo?: AstInfo;
};
export declare type OnGettingParams = GetCoreParams;
export declare type SetCoreParams = {
    key: string | number | symbol;
    newValue: FValue;
    astInfo?: AstInfo;
};
export declare type OnSettingParams = SetCoreParams;
export declare type FObjectBase = {
    get(params: GetParams): FValue;
    set(params: SetParams): void;
    toPrimitiveAsNumber(): number;
    toPrimitiveAsString(): string;
    toPrimitiveAsDefault?(): number | string;
    iterate?(): IterableIterator<FValue>;
    equals?(other: FValue, operator: '==' | '==='): boolean;
};
//# sourceMappingURL=types.d.ts.map