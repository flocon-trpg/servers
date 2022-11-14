import { Result } from '@kizahasi/result';
import { serverTransform, toClientState } from './functions';
import { back, backButRevealedOnce, face, template } from './types';
import { FilePath } from '@/ot/flocon/deckTemplate/card/types';
import { Default } from '@/ot/flocon/filePath/types';
import { State, TwoWayOperation } from '@/ot/generator';
import { admin, client, restrict } from '@/ot/requestedBy';

type CardState = State<typeof template>;
type CardTwoWayOperation = TwoWayOperation<typeof template>;

const createFaceFile = (n?: number): CardState['face'] => ({
    type: FilePath,
    filePath: {
        $v: 1,
        $r: 1,
        path: `https://example.com/face${n ?? 0}.png`,
        sourceType: Default,
    },
});

const createBackFile = (n?: number): CardState['back'] => ({
    type: FilePath,
    filePath: {
        $v: 1,
        $r: 1,
        path: `https://example.com/back${n ?? 0}.png`,
        sourceType: Default,
    },
});

describe('toClientState', () => {
    it.each([
        [{ type: admin }, { revealedTo: [] }],
        [{ type: restrict }, { revealedTo: [] }],
        [{ type: client, userUid: 'client_user_uid' }, { revealedTo: [] }],
    ] as const)(`tests revealStatus=${face} - %j`, (requestedBy, revealedTo) => {
        const source: CardState = {
            $v: 1,
            $r: 1,
            face: createFaceFile(),
            back: createBackFile(),
            revealStatus: face,
            sortKey: 1000,
            subSortKey: 'sub_sort_key',
        };
        const expected = { ...source };
        const actual = toClientState(requestedBy, revealedTo)(source);
        expect(actual).toEqual(expected);
    });

    it.each([
        [{ type: admin }, { revealedTo: [] }],
        [{ type: restrict }, { revealedTo: [] }],
        [{ type: client, userUid: 'client_user_uid' }, { revealedTo: [] }],
    ] as const)(`tests revealStatus=${backButRevealedOnce} - %j`, (requestedBy, revealedTo) => {
        const source: CardState = {
            $v: 1,
            $r: 1,
            face: createFaceFile(),
            back: createBackFile(),
            revealStatus: backButRevealedOnce,
            sortKey: 1000,
            subSortKey: 'sub_sort_key',
        };
        const expected = { ...source };
        const actual = toClientState(requestedBy, revealedTo)(source);
        expect(actual).toEqual(expected);
    });

    it.each([
        [{ type: restrict }, { revealedTo: [] }],
        [{ type: client, userUid: 'reveal_to' }, { revealedTo: ['another_user'] }],
    ] as const)(`tests revealStatus=${back} to not show face - %j`, (requestedBy, revealedTo) => {
        const source: CardState = {
            $v: 1,
            $r: 1,
            face: createFaceFile(),
            back: createBackFile(),
            revealStatus: back,
            sortKey: 1000,
            subSortKey: 'sub_sort_key',
        };
        const expected = { ...source, face: undefined };
        const actual = toClientState(requestedBy, revealedTo)(source);
        expect(actual).toEqual(expected);
    });

    it.each([
        [{ type: admin }, { revealedTo: [] }],
        [{ type: client, userUid: 'reveal_to' }, { revealedTo: ['reveal_to', 'another_user'] }],
    ] as const)(`tests revealStatus=${back} to show face - %j`, (requestedBy, revealedTo) => {
        const source: CardState = {
            $v: 1,
            $r: 1,
            face: createFaceFile(),
            back: createBackFile(),
            revealStatus: back,
            sortKey: 1000,
            subSortKey: 'sub_sort_key',
        };
        const expected = { ...source };
        const actual = toClientState(requestedBy, revealedTo)(source);
        expect(actual).toEqual(expected);
    });
});

describe('serverTransform', () => {
    it.each([
        {
            prevRevealStatus: face,
            nextRevealStatus: back,
            requestedBy: {
                type: restrict,
            },
        },
        {
            prevRevealStatus: face,
            nextRevealStatus: back,
            requestedBy: {
                type: client,
                userUid: 'test_user_uid',
            },
        },
        {
            prevRevealStatus: backButRevealedOnce,
            nextRevealStatus: back,
            requestedBy: {
                type: restrict,
            },
        },
        {
            prevRevealStatus: backButRevealedOnce,
            nextRevealStatus: back,
            requestedBy: {
                type: client,
                userUid: 'test_user_uid',
            },
        },
        {
            prevRevealStatus: back,
            nextRevealStatus: backButRevealedOnce,
            requestedBy: {
                type: admin,
            },
        },
    ] as const)(
        'should avoid updating revealStatus - %j',
        ({ prevRevealStatus, nextRevealStatus, requestedBy }) => {
            const state: CardState = {
                $v: 1,
                $r: 1,
                back: createBackFile(),
                face: createFaceFile(),
                revealStatus: prevRevealStatus,
                sortKey: 1000,
                subSortKey: 'sub_sort_key',
            };
            const actual = serverTransform(requestedBy)({
                stateBeforeServerOperation: state,
                stateAfterServerOperation: state,
                serverOperation: undefined,
                clientOperation: {
                    $v: 1,
                    $r: 1,
                    revealStatus: {
                        newValue: nextRevealStatus,
                    },
                },
            });
            expect(actual).toEqual(Result.ok(undefined));
        }
    );

    it.each([
        {
            prevRevealStatus: face,
            nextRevealStatus: back,
            requestedBy: {
                type: admin,
            },
        },
        {
            prevRevealStatus: backButRevealedOnce,
            nextRevealStatus: back,
            requestedBy: {
                type: admin,
            },
        },
        {
            prevRevealStatus: face,
            nextRevealStatus: backButRevealedOnce,
            requestedBy: {
                type: restrict,
            },
        },
        {
            prevRevealStatus: backButRevealedOnce,
            nextRevealStatus: face,
            requestedBy: {
                type: client,
                userUid: 'test_user_uid',
            },
        },
    ] as const)(
        'should successfully update revealStatus - %j',
        ({ prevRevealStatus, nextRevealStatus, requestedBy }) => {
            const state: CardState = {
                $v: 1,
                $r: 1,
                back: createBackFile(),
                face: createFaceFile(),
                revealStatus: prevRevealStatus,
                sortKey: 1000,
                subSortKey: 'sub_sort_key',
            };
            const actual = serverTransform(requestedBy)({
                stateBeforeServerOperation: state,
                stateAfterServerOperation: state,
                serverOperation: undefined,
                clientOperation: {
                    $v: 1,
                    $r: 1,
                    revealStatus: {
                        newValue: nextRevealStatus,
                    },
                },
            });
            const expected: CardTwoWayOperation = {
                $v: 1,
                $r: 1,
                revealStatus: {
                    oldValue: prevRevealStatus,
                    newValue: nextRevealStatus,
                },
            };
            expect(actual).toEqual(Result.ok(expected));
        }
    );
});
