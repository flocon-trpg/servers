import { DownError, ScalarError, TwoWayError, UpError } from './util/type';
type OtErrorParam = Exclude<ScalarError | UpError | DownError | TwoWayError, string>;
export declare class OtError extends Error {
    readonly otError: OtErrorParam;
    constructor(content: OtErrorParam);
}
export declare const toOtError: (content: OtErrorParam | string) => Error;
export {};
//# sourceMappingURL=otError.d.ts.map