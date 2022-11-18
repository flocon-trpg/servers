import { SemVer, alpha } from '@flocon-trpg/utils';

export const VERSION = new SemVer({
    major: 0,
    minor: 7,
    patch: 11,
    prerelease: {
        type: alpha,
        version: 2,
    },
});
