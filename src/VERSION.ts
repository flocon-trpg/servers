import { alpha, SemVer } from '@kizahasi/util';

const VERSION = new SemVer({
    major: 0,
    minor: 4,
    patch: 0,
    prerelease: {
        type: alpha,
        version: 3,
    },
});

export default VERSION;
