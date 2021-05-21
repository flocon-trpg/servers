import { alpha, SemVer } from './@shared/semver';

const VERSION = new SemVer({
    major: 0,
    minor: 2,
    patch: 0,
    prerelease: {
        type: alpha,
        version: 2,
    }
});

export default VERSION;
