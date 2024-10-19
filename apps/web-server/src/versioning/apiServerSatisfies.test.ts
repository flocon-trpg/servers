/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { SemVer, alpha } from '@flocon-trpg/utils';
import { apiServerSatisfies } from './apiServerSatisfies';
import { test, expect, describe } from 'vitest';

describe.each(['^', '~'] as const)('apiServerSatisfies', range => {
    test.each`
        semVer                                                                                   | expected
        ${new SemVer({ major: 0, minor: 2, patch: 2 })}                                          | ${false}
        ${new SemVer({ major: 1, minor: 0, patch: 1 })}                                          | ${false}
        ${new SemVer({ major: 1, minor: 1, patch: 0 })}                                          | ${false}
        ${new SemVer({ major: 1, minor: 1, patch: 1, prerelease: { type: alpha, version: 1 } })} | ${false}
        ${new SemVer({ major: 1, minor: 1, patch: 1 })}                                          | ${true}
        ${new SemVer({ major: 1, minor: 1, patch: 2 })}                                          | ${true}
        ${new SemVer({ major: 1, minor: 2, patch: 0 })}                                          | ${range === '^'}
        ${new SemVer({ major: 2, minor: 0, patch: 0, prerelease: { type: alpha, version: 1 } })} | ${false}
        ${new SemVer({ major: 2, minor: 0, patch: 0 })}                                          | ${false}
    `(`[${range}1.1.1]`, ({ semVer, expected }) => {
        const actual = apiServerSatisfies({
            expected: [
                {
                    min: new SemVer({ major: 1, minor: 1, patch: 1 }),
                    range: { type: range },
                },
            ],
            actual: semVer,
        });
        expect(actual).toBe(expected);
    });

    test.each`
        semVer                                          | expected
        ${new SemVer({ major: 0, minor: 1, patch: 0 })} | ${false}
        ${new SemVer({ major: 1, minor: 0, patch: 0 })} | ${true}
        ${new SemVer({ major: 1, minor: 1, patch: 0 })} | ${false}
        ${new SemVer({ major: 1, minor: 2, patch: 0 })} | ${true}
        ${new SemVer({ major: 1, minor: 3, patch: 0 })} | ${true}
        ${new SemVer({ major: 2, minor: 0, patch: 0 })} | ${false}
        ${new SemVer({ major: 3, minor: 0, patch: 0 })} | ${true}
    `(`[~1.0.0, ^1.2.0, ~3.0.0]`, ({ semVer, expected }) => {
        const actual = apiServerSatisfies({
            expected: [
                {
                    min: new SemVer({ major: 1, minor: 0, patch: 0 }),
                    range: { type: '~' },
                },
                {
                    min: new SemVer({ major: 1, minor: 2, patch: 0 }),
                    range: { type: '^' },
                },
                {
                    min: new SemVer({ major: 3, minor: 0, patch: 0 }),
                    range: { type: '~' },
                },
            ],
            actual: semVer,
        });
        expect(actual).toBe(expected);
    });
});
