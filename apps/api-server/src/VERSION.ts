import { SemVer, alpha } from '@flocon-trpg/utils';

export const VERSION = new SemVer({
    major: 0,
    minor: 7,
    patch: 0,
    prerelease: {
        type: alpha,
        version: 3,
    },
});
