import { SemVer } from '@flocon-trpg/utils';

export const VERSION = new SemVer({
    major: 0,
    minor: 7,
    patch: 16,
    prerelease: { type: 'rc', version: 4 },
});
