import { Result } from '@kizahasi/result';
import { z } from 'zod';
import { State, TwoWayOperation } from '../../../../../generator';
import { admin, client, restrict } from '../../../../../requestedBy';
import { cardImageValue } from '../../../../cardImage/types';
import { Default } from '../../../../filePath/types';
import { serverTransform, toClientState } from './functions';
import { back, backButRevealedOnce, face, template } from './types';

type CardState = State<typeof template>;
type CardImage = z.TypeOf<typeof cardImageValue>;
type CardTwoWayOperation = TwoWayOperation<typeof template>;

const createFaceFile = (n?: number): CardImage => ({
    $v: 1,
    $r: 1,
    type: 'FilePath',
    filePath: {
        $v: 1,
        $r: 1,
        path: `https://example.com/face${n ?? 0}.png`,
        sourceType: Default,
    },
});

const createBackFile = (n?: number): CardState['back'] => ({
    $v: 1,
    $r: 1,
    type: 'FilePath',
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
            $index: 0,
            face: createFaceFile(),
            back: createBackFile(),
            revealStatus: face,
            name: 'name',
            description: 'discription',
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
            $index: 0,
            face: createFaceFile(),
            back: createBackFile(),
            revealStatus: backButRevealedOnce,
            name: 'name',
            description: 'discription',
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
            $index: 0,
            face: createFaceFile(),
            back: createBackFile(),
            revealStatus: back,
            name: 'name',
            description: 'discription',
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
            $index: 0,
            face: createFaceFile(),
            back: createBackFile(),
            revealStatus: back,
            name: 'name',
            description: 'discription',
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
                $index: 0,
                back: createBackFile(),
                face: createFaceFile(),
                revealStatus: prevRevealStatus,
                name: 'name',
                description: 'discription',
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
                $index: 0,
                back: createBackFile(),
                face: createFaceFile(),
                revealStatus: prevRevealStatus,
                name: 'name',
                description: 'discription',
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
