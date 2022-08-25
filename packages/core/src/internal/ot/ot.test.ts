import {
    RequestedBy,
    State,
    StrIndex10,
    TwoWayOperation,
    UpOperation,
    admin,
    client,
    dicePieceTemplate,
    forceMaxLength100String,
    replace,
    roomTemplate,
    serverTransform,
    toOtError,
    update,
} from '../..';
import { Fixtures } from '../__test__/fixtures';
import * as TextOperation from './textOperation';

type RoomState = State<typeof roomTemplate>;
type RoomUpOperation = UpOperation<typeof roomTemplate>;
type RoomTwoWayOperation = TwoWayOperation<typeof roomTemplate>;

const undefinedOrError = 'undefinedOrError';

const textUpDiff = ({ prev, next }: { prev: string; next: string }) => {
    const diff = TextOperation.diff({ prev, next });
    if (diff == null) {
        return undefined;
    }
    return TextOperation.toUpOperation(diff);
};

namespace Test {
    export namespace Basic {
        export const testServerTransformToReject = ({
            prevState,
            currentState,
            serverOperation,
            clientOperation,
        }: {
            prevState: RoomState;
            currentState: RoomState;
            serverOperation: RoomTwoWayOperation | undefined;
            clientOperation: RoomUpOperation;
        }): void => {
            it.each`
                userUid
                ${Fixtures.Participant.None.userUid}
                ${Fixtures.Participant.Null.userUid}
                ${Fixtures.Participant.Spectator.userUid}
            `('tests $userUid', ({ userUid }: { userUid: string }) => {
                const actualOperation = serverTransform({
                    type: client,
                    userUid,
                })({
                    stateBeforeServerOperation: prevState,
                    stateAfterServerOperation: currentState,
                    serverOperation,
                    clientOperation,
                });
                if (actualOperation.isError) {
                    // OK
                    return;
                }
                expect(actualOperation.value).not.toEqual(expect.anything());
            });
        };

        export const setupTestServerTransform =
            ({
                prevState,
                currentState,
                serverOperation,
                clientOperation,
            }: {
                prevState: RoomState;
                currentState: RoomState;
                serverOperation: RoomTwoWayOperation | undefined;
                clientOperation: RoomUpOperation;
            }) =>
            ({
                testName,
                requestedBy,
                expected,
            }: {
                testName: string;
                requestedBy: RequestedBy;
                expected: RoomTwoWayOperation | undefined | typeof undefinedOrError;
            }) => {
                it(testName, () => {
                    const actualOperation = serverTransform(requestedBy)({
                        stateBeforeServerOperation: prevState,
                        stateAfterServerOperation: currentState,
                        serverOperation,
                        clientOperation,
                    });
                    if (actualOperation.isError) {
                        if (expected === undefinedOrError) {
                            return;
                        }
                        throw toOtError(actualOperation.error);
                    }
                    expect(actualOperation.value).toEqual(
                        expected === undefinedOrError ? undefined : expected
                    );
                });
            };
    }
}

describe.each([Fixtures.minimumState, Fixtures.complexState])('tests id', state => {
    const clientOperation: RoomUpOperation = {
        $v: 2,
        $r: 1,
    };

    Test.Basic.testServerTransformToReject({
        prevState: state,
        currentState: state,
        serverOperation: undefined,
        clientOperation,
    });

    const tester = Test.Basic.setupTestServerTransform({
        prevState: state,
        currentState: state,
        serverOperation: undefined,
        clientOperation,
    });

    tester({ testName: 'tests server', requestedBy: { type: admin }, expected: undefined });
    tester({
        testName: 'tests Player',
        requestedBy: { type: client, userUid: Fixtures.Participant.Player1.userUid },
        expected: undefined,
    });
});

describe.each([Fixtures.minimumState, Fixtures.complexState])('tests name', state => {
    const newName = 'NEW_NAME';

    const clientOperation: RoomUpOperation = {
        $v: 2,
        $r: 1,
        name: textUpDiff({ prev: state.name, next: newName }),
    };

    Test.Basic.testServerTransformToReject({
        prevState: state,
        currentState: state,
        serverOperation: undefined,
        clientOperation,
    });

    const tester = Test.Basic.setupTestServerTransform({
        prevState: state,
        currentState: state,
        serverOperation: undefined,
        clientOperation,
    });

    const expected: RoomTwoWayOperation = {
        $v: 2,
        $r: 1,
        name: TextOperation.diff({ prev: state.name, next: newName }),
    };

    tester({ testName: 'tests server', requestedBy: { type: admin }, expected });
    tester({
        testName: 'tests Player',
        requestedBy: { type: client, userUid: Fixtures.Participant.Player1.userUid },
        expected,
    });
});

describe.each`
    index
    ${'1'}
    ${'2'}
    ${'3'}
    ${'4'}
    ${'5'}
    ${'6'}
    ${'7'}
    ${'8'}
    ${'9'}
    ${'10'}
`('tests publicChannelName', ({ index }: { index: StrIndex10 }) => {
    const key = `publicChannel${index}Name` as const;

    const newName = 'NEW_NAME';

    const clientOperation: RoomUpOperation = {
        $v: 2,
        $r: 1,
        [key]: textUpDiff({ prev: Fixtures.minimumState[key], next: newName }),
    };

    Test.Basic.testServerTransformToReject({
        prevState: Fixtures.minimumState,
        currentState: Fixtures.minimumState,
        serverOperation: undefined,
        clientOperation,
    });

    const tester = Test.Basic.setupTestServerTransform({
        prevState: Fixtures.minimumState,
        currentState: Fixtures.minimumState,
        serverOperation: undefined,
        clientOperation,
    });

    const expected: RoomTwoWayOperation = {
        $v: 2,
        $r: 1,
        [key]: TextOperation.diff({
            prev: Fixtures.minimumState[key],
            next: newName,
        }),
    };

    tester({ testName: 'tests server', requestedBy: { type: admin }, expected });
    tester({
        testName: 'tests Player',
        requestedBy: { type: client, userUid: Fixtures.Participant.Player1.userUid },
        expected,
    });
});

describe.each`
    id          | isValidId
    ${'1'}      | ${true}
    ${'2'}      | ${true}
    ${'3'}      | ${true}
    ${'4'}      | ${true}
    ${'5'}      | ${true}
    ${'6'}      | ${false}
    ${'0'}      | ${false}
    ${'-1'}     | ${false}
    ${''}       | ${false}
    ${'STRING'} | ${false}
`('tests bgms', ({ id, isValidId }: { id: string; isValidId: boolean }) => {
    const newValue = {
        $v: 1 as const,
        $r: 1 as const,
        files: [
            {
                $v: 1 as const,
                $r: 1 as const,
                sourceType: 'Default' as const,
                path: 'PATH',
            },
        ],
        volume: 0.5,
        isPaused: false,
    };

    const clientOperation: RoomUpOperation = {
        $v: 2,
        $r: 1,
        bgms: {
            [id]: {
                type: replace,
                replace: {
                    newValue,
                },
            },
        },
    };

    Test.Basic.testServerTransformToReject({
        prevState: Fixtures.minimumState,
        currentState: Fixtures.minimumState,
        serverOperation: undefined,
        clientOperation,
    });

    const tester = Test.Basic.setupTestServerTransform({
        prevState: Fixtures.minimumState,
        currentState: Fixtures.minimumState,
        serverOperation: undefined,
        clientOperation,
    });

    const expected: RoomTwoWayOperation | typeof undefinedOrError = isValidId
        ? {
              $v: 2,
              $r: 1,
              bgms: {
                  [id]: {
                      type: replace,
                      replace: {
                          newValue,
                      },
                  },
              },
          }
        : undefinedOrError;

    tester({ testName: 'tests server', requestedBy: { type: admin }, expected });
    tester({
        testName: 'tests Player',
        requestedBy: { type: client, userUid: Fixtures.Participant.Player1.userUid },
        expected,
    });
});

describe('tests creating DicePieceValue', () => {
    const participantId = Fixtures.Participant.Player1.userUid;
    const boardId = 'BOARD_ID';
    const characterId = 'CHARACTER_ID';
    const dicePieceId = 'DICE_ID';

    const state: RoomState = {
        ...Fixtures.minimumState,
        boards: {
            [boardId]: Fixtures.Board.emptyState(participantId),
        },
        characters: {
            [characterId]: Fixtures.Character.emptyState(participantId),
        },
        participants: {
            ...Fixtures.minimumState.participants,
            [participantId]: {
                $v: 2,
                $r: 1,
                name: forceMaxLength100String('PARTICIPANT_NAME'),
                role: 'Player',
            },
        },
    };

    const newValue: State<typeof dicePieceTemplate> = {
        $v: 2,
        $r: 1,
        memo: undefined,
        name: undefined,
        dice: {
            '1': {
                $v: 1,
                $r: 1,
                dieType: 'D6',
                value: 1,
                isValuePrivate: false,
            },
        },
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        cellX: 0,
        cellY: 0,
        cellW: 0,
        cellH: 0,
        isCellMode: false,
        isPositionLocked: false,
        opacity: undefined,
        ownerCharacterId: characterId,
    };

    const clientOperation: RoomUpOperation = {
        $v: 2,
        $r: 1,
        boards: {
            [boardId]: {
                type: update,
                update: {
                    $v: 2,
                    $r: 1,
                    dicePieces: {
                        [dicePieceId]: {
                            type: replace,
                            replace: {
                                newValue,
                            },
                        },
                    },
                },
            },
        },
    };

    Test.Basic.testServerTransformToReject({
        prevState: state,
        currentState: state,
        serverOperation: undefined,
        clientOperation,
    });

    const tester = Test.Basic.setupTestServerTransform({
        prevState: state,
        currentState: state,
        serverOperation: undefined,
        clientOperation,
    });

    const expected: RoomTwoWayOperation = {
        $v: 2,
        $r: 1,
        boards: {
            [boardId]: {
                type: update,
                update: {
                    $v: 2,
                    $r: 1,
                    dicePieces: {
                        [dicePieceId]: {
                            type: replace,
                            replace: {
                                newValue,
                            },
                        },
                    },
                },
            },
        },
    };

    tester({ testName: 'tests server', requestedBy: { type: admin }, expected });
    tester({
        testName: 'tests Owner Player',
        requestedBy: { type: client, userUid: Fixtures.Participant.Player1.userUid },
        expected,
    });
    tester({
        testName: 'tests Non-owner Player',
        requestedBy: { type: client, userUid: Fixtures.Participant.Player2.userUid },
        expected: undefined,
    });
});

describe('tests creating Character', () => {
    const ownerParticipantId = Fixtures.Participant.Player1.userUid;
    const characterId = 'CHARACTER_ID';

    const state: RoomState = Fixtures.minimumState;

    const clientOperation: RoomUpOperation = {
        $v: 2,
        $r: 1,
        characters: {
            [characterId]: {
                type: replace,
                replace: {
                    newValue: Fixtures.Character.emptyState(ownerParticipantId),
                },
            },
        },
    };

    Test.Basic.testServerTransformToReject({
        prevState: state,
        currentState: state,
        serverOperation: undefined,
        clientOperation,
    });

    const tester = Test.Basic.setupTestServerTransform({
        prevState: state,
        currentState: state,
        serverOperation: undefined,
        clientOperation,
    });

    const expected: RoomTwoWayOperation = {
        $v: 2,
        $r: 1,
        characters: {
            [characterId]: {
                type: replace,
                replace: {
                    newValue: Fixtures.Character.emptyState(ownerParticipantId),
                },
            },
        },
    };

    tester({ testName: 'tests server', requestedBy: { type: admin }, expected });
    tester({
        testName: 'tests Owner Player',
        requestedBy: { type: client, userUid: Fixtures.Participant.Player1.userUid },
        expected,
    });
    tester({
        testName: 'tests Non-owner Player',
        requestedBy: { type: client, userUid: Fixtures.Participant.Player2.userUid },
        expected: undefined,
    });
});

describe.each([[true], [false]])(
    'tests updating Character when isPrivate === %o',
    (isPrivate: boolean) => {
        const ownerParticipantId = Fixtures.Participant.Player1.userUid;
        const characterId = 'CHARACTER_ID';
        const newName = 'NEW_NAME';

        const state: RoomState = {
            ...Fixtures.minimumState,
            characters: {
                [characterId]: {
                    ...Fixtures.Character.emptyState(ownerParticipantId),
                    isPrivate,
                },
            },
            participants: {
                ...Fixtures.minimumState.participants,
                [ownerParticipantId]: {
                    $v: 2,
                    $r: 1,
                    name: forceMaxLength100String('PARTICIPANT_NAME'),
                    role: 'Player',
                },
            },
        };

        const clientOperation: RoomUpOperation = {
            $v: 2,
            $r: 1,
            characters: {
                [characterId]: {
                    type: update,
                    update: {
                        $v: 2,
                        $r: 1,
                        name: textUpDiff({
                            prev: Fixtures.Character.emptyState(ownerParticipantId).name,
                            next: newName,
                        }),
                    },
                },
            },
        };

        Test.Basic.testServerTransformToReject({
            prevState: state,
            currentState: state,
            serverOperation: undefined,
            clientOperation,
        });

        const tester = Test.Basic.setupTestServerTransform({
            prevState: state,
            currentState: state,
            serverOperation: undefined,
            clientOperation,
        });

        const expected: RoomTwoWayOperation = {
            $v: 2,
            $r: 1,
            characters: {
                [characterId]: {
                    type: update,
                    update: {
                        $v: 2,
                        $r: 1,
                        name: TextOperation.diff({
                            prev: Fixtures.Character.emptyState(ownerParticipantId).name,
                            next: newName,
                        }),
                    },
                },
            },
        };

        tester({ testName: 'tests server', requestedBy: { type: admin }, expected });
        tester({
            testName: 'tests Owner Player',
            requestedBy: { type: client, userUid: Fixtures.Participant.Player1.userUid },
            expected,
        });
        tester({
            testName: 'tests Non-owner Player',
            requestedBy: { type: client, userUid: Fixtures.Participant.Player2.userUid },
            expected: isPrivate ? undefined : expected,
        });
    }
);

describe.each([[true], [false]])(
    'tests deleting Character when isPrivate === %o',
    (isPrivate: boolean) => {
        const ownerParticipantId = Fixtures.Participant.Player1.userUid;
        const characterId = 'CHARACTER_ID';

        const state: RoomState = {
            ...Fixtures.minimumState,
            characters: {
                [characterId]: {
                    ...Fixtures.Character.emptyState(ownerParticipantId),
                    isPrivate,
                },
            },
            participants: {
                ...Fixtures.minimumState.participants,
                [Fixtures.Participant.Player1.userUid]: {
                    $v: 2,
                    $r: 1,
                    name: Fixtures.Participant.Player1.name,
                    role: 'Player',
                },
            },
        };

        const clientOperation: RoomUpOperation = {
            $v: 2,
            $r: 1,
            characters: {
                [characterId]: {
                    type: replace,
                    replace: {
                        newValue: undefined,
                    },
                },
            },
        };

        Test.Basic.testServerTransformToReject({
            prevState: state,
            currentState: state,
            serverOperation: undefined,
            clientOperation,
        });

        const tester = Test.Basic.setupTestServerTransform({
            prevState: state,
            currentState: state,
            serverOperation: undefined,
            clientOperation,
        });

        const expected: RoomTwoWayOperation = {
            $v: 2,
            $r: 1,
            characters: {
                [characterId]: {
                    type: replace,
                    replace: {
                        oldValue: {
                            ...Fixtures.Character.emptyState(ownerParticipantId),
                            isPrivate,
                        },
                        newValue: undefined,
                    },
                },
            },
        };

        tester({ testName: 'tests server', requestedBy: { type: admin }, expected });
        tester({
            testName: 'tests Owner Player',
            requestedBy: { type: client, userUid: Fixtures.Participant.Player1.userUid },
            expected,
        });
        tester({
            testName: 'tests Non-owner Player',
            requestedBy: { type: client, userUid: Fixtures.Participant.Player2.userUid },
            expected: isPrivate ? undefined : expected,
        });
    }
);
