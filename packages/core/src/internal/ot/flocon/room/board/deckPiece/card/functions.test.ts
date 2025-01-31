import { Result } from '@kizahasi/result';
import { z } from 'zod';
import { State, TwoWayOperation } from '../../../../../generator/types';
import { RequestedBy, admin, client, restrict } from '../../../../../requestedBy';
import { cardImageValue } from '../../../../cardImage/types';
import { Default } from '../../../../filePath/types';
import { serverTransform, toClientState } from './functions';
import { back, backButRevealedOnce, face, revealStatus, revealedAtCreate, template } from './types';

type CardState = State<typeof template>;
type CardImage = z.TypeOf<typeof cardImageValue>;
type CardTwoWayOperation = TwoWayOperation<typeof template>;

type RevealStatus = z.TypeOf<typeof revealStatus>;

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
            revealStatus: { type: face, revealedBy: { type: client, userUid: 'client_user_uid' } },
            groupId: 'group_id',
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
            revealStatus: {
                type: backButRevealedOnce,
                revealedBy: { type: client, userUid: 'client_user_uid' },
            },
            groupId: 'group_id',
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
            revealStatus: { type: back },
            groupId: 'group_id',
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
            revealStatus: { type: back },
            groupId: 'group_id',
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
            prevRevealStatus: { type: face, revealedBy: { type: revealedAtCreate } },
            nextRevealStatus: { type: back },
            requestedBy: {
                type: restrict,
            },
        },
        {
            prevRevealStatus: { type: face, revealedBy: { type: revealedAtCreate } },
            nextRevealStatus: { type: back },
            requestedBy: {
                type: client,
                userUid: 'test_user_uid',
            },
        },
        {
            prevRevealStatus: {
                type: backButRevealedOnce,
                revealedBy: { type: client, userUid: 'test_revealed_user_uid' },
            },
            nextRevealStatus: { type: back },
            requestedBy: {
                type: restrict,
            },
        },
        {
            prevRevealStatus: {
                type: backButRevealedOnce,
                revealedBy: { type: client, userUid: 'test_revealed_user_uid' },
            },
            nextRevealStatus: { type: back },
            requestedBy: {
                type: client,
                userUid: 'test_user_uid',
            },
        },
        {
            prevRevealStatus: { type: back },
            nextRevealStatus: {
                type: backButRevealedOnce,
                revealedBy: { type: client, userUid: 'test_revealed_user_uid' },
            },
            requestedBy: {
                type: admin,
            },
        },
    ] satisfies {
        prevRevealStatus: RevealStatus;
        nextRevealStatus: RevealStatus;
        requestedBy: RequestedBy;
    }[])(
        'should avoid updating revealStatus - %j',
        ({ prevRevealStatus, nextRevealStatus, requestedBy }) => {
            const state: CardState = {
                $v: 1,
                $r: 1,
                $index: 0,
                face: createFaceFile(),
                revealStatus: prevRevealStatus,
                groupId: 'group_id',
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
        },
    );

    it.each([
        {
            prevRevealStatus: { type: face, revealedBy: { type: revealedAtCreate } },
            nextRevealStatus: { type: back },
            requestedBy: {
                type: admin,
            },
        },
        {
            prevRevealStatus: {
                type: backButRevealedOnce,
                revealedBy: { type: client, userUid: 'test_revealed_user_uid' },
            },
            nextRevealStatus: { type: back },
            requestedBy: {
                type: admin,
            },
        },
        {
            prevRevealStatus: {
                type: face,
                revealedBy: { type: client, userUid: 'test_revealed_user_uid' },
            },
            nextRevealStatus: {
                type: backButRevealedOnce,
                revealedBy: { type: client, userUid: 'test_revealed_user_uid' },
            },
            requestedBy: {
                type: restrict,
            },
        },
        {
            prevRevealStatus: {
                type: backButRevealedOnce,
                revealedBy: { type: client, userUid: 'test_revealed_user_uid' },
            },
            nextRevealStatus: {
                type: face,
                revealedBy: { type: client, userUid: 'test_revealed_user_uid' },
            },
            requestedBy: {
                type: client,
                userUid: 'test_user_uid',
            },
        },
    ] satisfies {
        prevRevealStatus: RevealStatus;
        nextRevealStatus: RevealStatus;
        requestedBy: RequestedBy;
    }[])(
        'should successfully update revealStatus - %j',
        ({ prevRevealStatus, nextRevealStatus, requestedBy }) => {
            const state: CardState = {
                $v: 1,
                $r: 1,
                $index: 0,
                face: createFaceFile(),
                revealStatus: prevRevealStatus,
                groupId: 'group_id',
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
        },
    );
});
