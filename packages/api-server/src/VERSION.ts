import { SemVer, beta } from '@flocon-trpg/utils';

export const VERSION = new SemVer({
    major: 0,
    minor: 5,
    patch: 3,
    prerelease: {
        type: beta,
        version: 1,
    },
});
