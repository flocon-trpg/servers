import { SemVer, SemverOption, alpha, beta, rc } from '..';

it.each`
    left                                                                                         | operator | right
    ${{ major: 1, minor: 0, patch: 0 } as SemverOption}                                          | ${'='}   | ${{ major: 1, minor: 0, patch: 0 } as SemverOption}
    ${{ major: 1, minor: 0, patch: 0, prerelease: { type: beta, version: 1 } } as SemverOption}  | ${'='}   | ${{ major: 1, minor: 0, patch: 0, prerelease: { type: beta, version: 1 } } as SemverOption}
    ${{ major: 1, minor: 0, patch: 0, prerelease: { type: alpha, version: 1 } } as SemverOption} | ${'<'}   | ${{ major: 1, minor: 0, patch: 0, prerelease: { type: beta, version: 1 } } as SemverOption}
    ${{ major: 1, minor: 0, patch: 0, prerelease: { type: alpha, version: 2 } } as SemverOption} | ${'<'}   | ${{ major: 1, minor: 0, patch: 0, prerelease: { type: beta, version: 1 } } as SemverOption}
    ${{ major: 1, minor: 0, patch: 0, prerelease: { type: beta, version: 1 } } as SemverOption}  | ${'<'}   | ${{ major: 1, minor: 0, patch: 0, prerelease: { type: rc, version: 1 } } as SemverOption}
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
            fail('Only "=" and "<" are supported');
    }

    const leftSemver = new SemVer(left);
    const rightSemver = new SemVer(right);

    if (castedOperator === '=') {
        expect(SemVer.compare(leftSemver, '=', rightSemver)).toBe(true);
        expect(SemVer.compare(rightSemver, '=', leftSemver)).toBe(true);

        expect(SemVer.compare(leftSemver, '<=', rightSemver)).toBe(true);
        expect(SemVer.compare(rightSemver, '>=', leftSemver)).toBe(true);

        expect(SemVer.compare(leftSemver, '>=', rightSemver)).toBe(true);
        expect(SemVer.compare(rightSemver, '<=', leftSemver)).toBe(true);
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

it.each([
    {
        source: { major: 0, minor: 1, patch: 2 } as SemverOption,
        string: '0.1.2',
    },
    {
        source: {
            major: 1,
            minor: 0,
            patch: 0,
            prerelease: { type: alpha, version: 1 },
        } as SemverOption,
        string: '1.0.0-alpha.1',
    },
    {
        source: {
            major: 1,
            minor: 2,
            patch: 3,
            prerelease: { type: beta, version: 2 },
        } as SemverOption,
        string: '1.2.3-beta.2',
    },
    {
        source: {
            major: 2,
            minor: 0,
            patch: 0,
            prerelease: { type: rc, version: 3 },
        } as SemverOption,
        string: '2.0.0-rc.3',
    },
])('compare Semver', ({ source, string }) => {
    const actual = new SemVer(source).toString();
    expect(actual).toBe(string);
});
