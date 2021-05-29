import { alpha, SemVer } from '@kizahasi/util';

const VERSION = new SemVer({
    major: 0,
    minor: 2,
    patch: 0,
    prerelease: {
        type: alpha,
        version: 23,
    }
});

export default VERSION;
