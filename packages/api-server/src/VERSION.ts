import { SemVer, beta } from '@flocon-trpg/utils';

export const VERSION = new SemVer({
    major: 0,
    minor: 5,
    patch: 0,
    prerelease: {
        type: beta,
        version: 2,
    },
});
