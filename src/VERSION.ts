import { SemVer, alpha } from '@kizahasi/util';

const VERSION = new SemVer({
    major: 0,
    minor: 2,
    patch: 0,
    prerelease: {
        type: alpha,
        version: 14,
    }
});

export default VERSION;
