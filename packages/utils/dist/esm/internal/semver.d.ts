import { Operator } from './compare';
export declare const alpha = "alpha";
export declare const beta = "beta";
export declare const rc = "rc";
type Prerelease = {
    type: typeof alpha | typeof beta | typeof rc;
    version: number;
};
export type SemverOption = {
    major: number;
    minor: number;
    patch: number;
    prerelease?: Prerelease | null;
};
export declare class SemVer {
    readonly major: number;
    readonly minor: number;
    readonly patch: number;
    readonly prerelease: Readonly<Prerelease> | null;
    private static requireToBePositiveInteger;
    private static requireToBeNonNegativeInteger;
    constructor(option: SemverOption);
    toString(): string;
    private static prereleaseTypeToNumber;
    private static compareCore;
    /**
    npmのsemverとは異なり、例えば 1.0.0 < 1.0.1-alpha.1 はtrueを返す。注意！
    */
    static compare(left: SemVer, operator: Operator, right: SemVer): boolean;
}
export {};
//# sourceMappingURL=semver.d.ts.map