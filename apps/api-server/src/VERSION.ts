import { SemVer, beta } from '@flocon-trpg/utils';

export const VERSION = new SemVer({
    major: 0,
    minor: 6,
    patch: 1,
    prerelease: {
        type: beta,
        version: 4,
    },
});
