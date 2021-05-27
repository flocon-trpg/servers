// # alpha
// いかなる変更でも起こりうる状態。ソースコードの内容を理解している方向け。
// 互換性のない変更があってもmajorとminorの規則に従わなくてもいいという特殊な規則がある。
// minor=patch=0にすることを推奨。ただし、コードの変更量が非常に多い場合などは従わなくてもよい。
//
// # beta
// 安定性と引き換えになるべく新しいバージョンに触れてみたい方向け。バグ報告やフィードバックを開発者以外からも受け取りたい場合に用いる。
// x.y.z-beta.nからbetaを外すとき、次のバージョンはx.y.(z+1)ではなくx.y.zにする。理由は、例えば2.0.0-alpha.n→2.0.0-beta.n→2.0.0-rc.nのように用いる場合と整合性を持たせるため。
//
// # rc
// 大規模なアップデートの正式版リリース直前に用いられる。betaのような不安定さは望まないが、新バージョンに早く触れてみたい方向け。betaはmajorやminorが変わるレベルの新機能の追加を取りやめることがありうるが、rcではそれは原則として避ける点で異なる。
// minor=patch=0にすることを推奨。ただし、コードの変更量が非常に多い場合などは従わなくてもよい。
export const alpha = 'alpha';
export const beta = 'beta';
export const rc = 'rc';

type Prerelease = {
    type: typeof alpha | typeof beta | typeof rc;
    version: number;
};

export type Operator = '=' | '<' | '<=' | '>' | '>=';

export type SemverOption = {
    major: number;
    minor: number;
    patch: number;
    prerelease?: Prerelease | null;
};

export const ok = 'ok';
export const apiServerRequiresUpdate = 'apiServerRequiresUpdate';
export const webServerRequiresUpdate = 'webServerRequiresUpdate';
type CheckResult =
    | typeof ok
    | typeof apiServerRequiresUpdate
    | typeof webServerRequiresUpdate
    | typeof alpha;

export class SemVer {
    public readonly major: number;
    public readonly minor: number;
    public readonly patch: number;
    public readonly prerelease: Readonly<Prerelease> | null;

    private static requireToBePositiveInteger(
        source: number,
        propName: string
    ) {
        if (!Number.isInteger(source)) {
            throw new Error(
                `Semver error: ${propName} must be integer. Actual value is "${source}"`
            );
        }
        if (source <= 0) {
            throw new Error(
                `Semver error: ${propName} must be positive. Actual value is "${source}"`
            );
        }
    }

    private static requireToBeNonNegativeInteger(
        source: number,
        propName: string
    ) {
        if (!Number.isInteger(source)) {
            throw new Error(
                `Semver error: ${propName} must be integer. Actual value is "${source}"`
            );
        }
        if (source < 0) {
            throw new Error(
                `Semver error: ${propName} must not be negative. Actual value is "${source}"`
            );
        }
    }
    public constructor(option: SemverOption) {
        SemVer.requireToBeNonNegativeInteger(option.major, 'major');
        SemVer.requireToBeNonNegativeInteger(option.minor, 'minor');
        SemVer.requireToBeNonNegativeInteger(option.patch, 'patch');
        if (option.prerelease != null) {
            SemVer.requireToBePositiveInteger(
                option.prerelease.version,
                'prerelease version'
            );
        }

        this.major = option.major;
        this.minor = option.minor;
        this.patch = option.patch;
        this.prerelease = option.prerelease ?? null;
    }

    public toString(): string {
        if (this.prerelease == null) {
            return `${this.major}.${this.minor}.${this.patch}`;
        }
        return `${this.major}.${this.minor}.${this.patch}-${this.prerelease.type}.${this.prerelease.version}`;
    }

    private static compareNumbers(
        left: number,
        operator: Operator,
        right: number
    ): boolean {
        switch (operator) {
            case '=':
                return left === right;
            case '<':
                return left < right;
            case '<=':
                return left <= right;
            case '>':
                return left > right;
            case '>=':
                return left >= right;
        }
    }

    private static prereleaseTypeToNumber(
        type: typeof alpha | typeof beta | typeof rc | null | undefined
    ): number {
        if (type == null) {
            return 0;
        }
        switch (type) {
            case rc:
                return -1;
            case beta:
                return -2;
            case alpha:
                return -3;
        }
    }

    private static compareCore(
        left: SemVer,
        operator: '=' | '<' | '>',
        right: SemVer
    ): boolean {
        // majorが異なるなら値を即座に返し、同じなら次の判定処理に進むという戦略。他も同様。
        if (left.major !== right.major) {
            return SemVer.compareNumbers(left.major, operator, right.major);
        }
        if (left.minor !== right.minor) {
            return SemVer.compareNumbers(left.minor, operator, right.minor);
        }
        if (left.patch !== right.patch) {
            return SemVer.compareNumbers(left.patch, operator, right.patch);
        }

        const leftPreleaseTypeAsNumber = SemVer.prereleaseTypeToNumber(
            left.prerelease?.type
        );
        const rightPreleaseTypeAsNumber = SemVer.prereleaseTypeToNumber(
            right.prerelease?.type
        );

        if (leftPreleaseTypeAsNumber !== rightPreleaseTypeAsNumber) {
            return SemVer.compareNumbers(
                leftPreleaseTypeAsNumber,
                operator,
                rightPreleaseTypeAsNumber
            );
        }

        // ?? の右側の-1は、実際は使われることはない
        return SemVer.compareNumbers(
            left.prerelease?.version ?? -1,
            operator,
            right.prerelease?.version ?? -1
        );
    }

    /**
    npmのsemverとは異なり、例えば 1.0.0 < 1.0.1-alpha.1 はtrueを返す。注意！
    */
    public static compare(
        left: SemVer,
        operator: Operator,
        right: SemVer
    ): boolean {
        switch (operator) {
            case '=':
            case '<':
            case '>':
                return SemVer.compareCore(left, operator, right);
            case '<=':
                return !SemVer.compareCore(left, '>', right);
            case '>=':
                return !SemVer.compareCore(left, '<', right);
        }
    }

    /**
     *
     * @returns apiサーバーとwebサーバーのバージョンの関係に問題がないならば"ok"。alphaの場合、majorとminorが同じでも互換性がある保証はないため、"alpha"が返される。
     */
    public static check({
        api,
        web,
    }: {
        api: SemVer;
        web: SemVer;
    }): CheckResult {
        if (api.major === web.major) {
            if (api.minor < web.minor) {
                return apiServerRequiresUpdate;
            }
            if (
                api.prerelease?.type === alpha ||
                web.prerelease?.type === alpha
            ) {
                return alpha;
            }
            return ok;
        }

        if (api.major > web.major) {
            return webServerRequiresUpdate;
        }
        if (api.major < web.major) {
            return apiServerRequiresUpdate;
        }

        return ok;
    }
}
