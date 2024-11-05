import { FBoolean } from './FBoolean';
import { FNumber } from './FNumber';
import { FString } from './FString';
import { FValue } from './FValue';
export declare const compareToNumber: (left: FValue, right: FValue, hint: "default" | "string" | "number", comparer: (left: any, right: any) => number) => FNumber;
export declare const compareToBoolean: (left: FValue, right: FValue, hint: "default" | "string" | "number" | "JObject", comparer: (left: any, right: any) => boolean) => FBoolean;
export declare const compareToNumberOrString: (left: FValue, right: FValue, hint: "default", comparer: (left: any, right: any) => number | string) => FNumber | FString;
//# sourceMappingURL=compare.d.ts.map