import { alpha, beta, SemVer, SemverOption } from '../src/internal/semver';

it.each`
    left                                                                                         | operator | right
    ${{ major: 1, minor: 0, patch: 0 } as SemverOption}                                          | ${'='}   | ${{ major: 1, minor: 0, patch: 0 } as SemverOption}
    ${{ major: 1, minor: 0, patch: 0, prerelease: { type: beta, version: 1 } } as SemverOption}  | ${'='}   | ${{ major: 1, minor: 0, patch: 0, prerelease: { type: beta, version: 1 } } as SemverOption}
    ${{ major: 1, minor: 0, patch: 0, prerelease: { type: alpha, version: 1 } } as SemverOption} | ${'<'}   | ${{ major: 1, minor: 0, patch: 0, prerelease: { type: beta, version: 1 } } as SemverOption}
    ${{ major: 1, minor: 0, patch: 0, prerelease: { type: alpha, version: 2 } } as SemverOption} | ${'<'}   | ${{ major: 1, minor: 0, patch: 0, prerelease: { type: beta, version: 1 } } as SemverOption}
    ${{ major: 1, minor: 0, patch: 0, prerelease: { type: beta, version: 1 } } as SemverOption}  | ${'<'}   | ${{ major: 1, minor: 0, patch: 0 } as SemverOption}
    ${{ major: 1, minor: 0, patch: 0 } as SemverOption}                                          | ${'<'}   | ${{ major: 1, minor: 0, patch: 1, prerelease: { type: alpha, version: 1 } } as SemverOption}
    ${{ major: 1, minor: 0, patch: 1 } as SemverOption}                                          | ${'<'}   | ${{ major: 1, minor: 1, patch: 0 } as SemverOption}
    ${{ major: 1, minor: 1, patch: 1 } as SemverOption}                                          | ${'<'}   | ${{ major: 2, minor: 0, patch: 0 } as SemverOption}
`('compare Semver', ({ left, operator, right }) => {
    let castedOperator: '=' | '<';
    switch (operator) {
        case '=':
        case '<':
            castedOperator = operator;
            break;
        default:
            fail('Only "=" or "<" are supported');
    }

    const leftSemver = new SemVer(left);
    const rightSemver = new SemVer(right);

    if (castedOperator === '=') {
        expect(SemVer.compare(leftSemver, '=', rightSemver)).toBe(true);
        expect(SemVer.compare(rightSemver, '=', leftSemver)).toBe(true);
        return;
    }

    expect(SemVer.compare(leftSemver, '=', rightSemver)).toBe(false);
    expect(SemVer.compare(rightSemver, '=', leftSemver)).toBe(false);

    expect(SemVer.compare(leftSemver, '<', rightSemver)).toBe(true);
    expect(SemVer.compare(rightSemver, '>', leftSemver)).toBe(true);

    expect(SemVer.compare(leftSemver, '<=', rightSemver)).toBe(true);
    expect(SemVer.compare(rightSemver, '>=', leftSemver)).toBe(true);

    expect(SemVer.compare(leftSemver, '>', rightSemver)).toBe(false);
    expect(SemVer.compare(rightSemver, '<', leftSemver)).toBe(false);

    expect(SemVer.compare(leftSemver, '>=', rightSemver)).toBe(false);
    expect(SemVer.compare(rightSemver, '<=', leftSemver)).toBe(false);
});
