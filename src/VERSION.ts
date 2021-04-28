import { alpha, SemVer } from './@shared/semver';

const VERSION = new SemVer({
    major: 0,
    minor: 1,
    patch: 0,
    prerelease: {
        type: alpha,
        version: 26,
    }
});

export default VERSION;
