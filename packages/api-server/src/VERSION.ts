import { SemVer, beta } from '@flocon-trpg/utils';

export const VERSION = new SemVer({
    major: 0,
    minor: 1,
    patch: 0,
    prerelease: {
        type: beta,
        version: 1,
    },
});
