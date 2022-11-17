import { Result } from '@kizahasi/result';
export declare type ParseError = {
    ja: string;
};
export declare const parseStringToBooleanError: ParseError;
declare type ValueType<T> = Exclude<T, string> | (T extends string ? boolean : never);
export declare const parseStringToBoolean: <T extends string | null | undefined>(source: T) => Result<ValueType<T>, ParseError>;
export {};
//# sourceMappingURL=parseStringToBoolean.d.ts.map