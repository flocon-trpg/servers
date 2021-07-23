import { SemVer, alpha } from '@kizahasi/util';

const VERSION = new SemVer({
    major: 0,
    minor: 3,
    patch: 0,
    prerelease: {
        type: alpha,
        version: 11,
    },
});

export default VERSION;
