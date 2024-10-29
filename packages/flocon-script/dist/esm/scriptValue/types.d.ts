import { Range } from '../range';
import { FValue } from './FValue';
export type AstInfo = {
    range?: Range;
};
export type GetParams = {
    property: FValue;
    astInfo?: AstInfo;
};
export type SetParams = {
    property: FValue;
    newValue: FValue;
    astInfo?: AstInfo;
};
export type GetCoreParams = {
    key: string | number | symbol;
    astInfo?: AstInfo;
};
export type OnGettingParams = GetCoreParams;
export type SetCoreParams = {
    key: string | number | symbol;
    newValue: FValue;
    astInfo?: AstInfo;
};
export type OnSettingParams = SetCoreParams;
export type FObjectBase = {
    get(params: GetParams): FValue;
    set(params: SetParams): void;
    toPrimitiveAsNumber(): number;
    toPrimitiveAsString(): string;
    toPrimitiveAsDefault?(): number | string;
    iterate?(): IterableIterator<FValue>;
    equals?(other: FValue, operator: '==' | '==='): boolean;
    toString(): string;
};
//# sourceMappingURL=types.d.ts.map