import { beta, SemVer } from '@flocon-trpg/utils';
import { ClientVersion } from './utils/clientVersion';

export const VERSION: ClientVersion = {
    major: 0,
    minor: 1,
    prefix: beta,
};

// 例えば >=1.2.0 と >=3.0.0 の両方に対応可能なケースも考えられるため、配列を用いている。
export const SupportedApiServers: ReadonlyArray<SemVer> = [
    new SemVer({
        major: 0,
        minor: 1,
        patch: 0,
        prerelease: {
            type: beta,
            version: 1,
        },
    }),
];

export const apiServerSatisfies = ({
    expected,
    actual,
}: {
    expected: ReadonlyArray<SemVer>;
    actual: SemVer;
}): boolean => {
    for (const expectedElement of expected) {
        if (SemVer.compare(expectedElement, '<=', actual)) {
            return true;
        }
    }
    return false;
};
