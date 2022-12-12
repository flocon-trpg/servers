import { getOpenRollCall } from './getOpenRollCall';

describe('getOpenRollCall', () => {
    beforeAll(() => {
        jest.useFakeTimers();
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('should not fail on {}', () => {
        jest.setSystemTime(new Date().setFullYear(2000));

        const actual = getOpenRollCall({});
        expect(actual).toBeUndefined();
    });

    it('should return value not closed', () => {
        jest.setSystemTime(1_000_150);

        const actual = getOpenRollCall({
            key1: {
                $v: 1,
                $r: 1,
                createdAt: 1_000_000,
                createdBy: 'user1',
                closeStatus: undefined,
                participants: {
                    user1: {
                        $v: 1,
                        $r: 1,
                        answeredAt: undefined,
                    },
                    user2: {
                        $v: 1,
                        $r: 1,
                        answeredAt: 1_000_000,
                    },
                },
            },
            key2: {
                $v: 1,
                $r: 1,
                createdAt: 1_000_000,
                createdBy: 'user2',
                closeStatus: { closedBy: 'user2', reason: 'Closed' },
                participants: {
                    user1: {
                        $v: 1,
                        $r: 1,
                        answeredAt: 1_000_000,
                    },
                    user2: {
                        $v: 1,
                        $r: 1,
                        answeredAt: undefined,
                    },
                },
            },
        });

        expect(actual).toEqual({
            key: 'key1',
            value: {
                $v: 1,
                $r: 1,
                createdAt: 1_000_000,
                createdBy: 'user1',
                closeStatus: undefined,
                participants: {
                    user1: {
                        $v: 1,
                        $r: 1,
                        answeredAt: undefined,
                    },
                    user2: {
                        $v: 1,
                        $r: 1,
                        answeredAt: 1_000_000,
                    },
                },
            },
        });
    });
});
