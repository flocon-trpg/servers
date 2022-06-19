import { SemVer, beta } from '@flocon-trpg/utils';

export const VERSION = new SemVer({
    major: 0,
    minor: 7,
    patch: 6,
    prerelease: {
        type: beta,
        version: 1,
    },
});
