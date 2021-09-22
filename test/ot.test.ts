import { StrIndex10 } from '@kizahasi/util';
import {
    State,
    UpOperation,
    serverTransform,
    TwoWayOperation,
    client,
    RequestedBy,
    admin,
    replace,
    update,
} from '../src';
import { Resources } from './resources';

const undefinedOrError = 'undefinedOrError';

namespace Test {
    export namespace Basic {
        export const testServerTransformToReject = ({
            prevState,
            currentState,
            serverOperation,
            clientOperation,
        }: {
            prevState: State;
            currentState: State;
            serverOperation: TwoWayOperation | undefined;
            clientOperation: UpOperation;
        }): void => {
            it.each`
                userUid
                ${Resources.Participant.None.userUid}
                ${Resources.Participant.Null.userUid}
                ${Resources.Participant.Spectator.userUid}
            `('tests $userUid', ({ userUid }: { userUid: string }) => {
                const actualOperation = serverTransform({
                    type: client,
                    userUid,
                })({ prevState, currentState, serverOperation, clientOperation });
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
                prevState: State;
                currentState: State;
                serverOperation: TwoWayOperation | undefined;
                clientOperation: UpOperation;
            }) =>
            ({
                testName,
                requestedBy,
                expected,
            }: {
                testName: string;
                requestedBy: RequestedBy;
                expected: TwoWayOperation | undefined | typeof undefinedOrError;
            }) => {
                it(testName, () => {
                    const actualOperation = serverTransform(requestedBy)({
                        prevState,
                        currentState,
                        serverOperation,
                        clientOperation,
                    });
                    if (actualOperation.isError) {
                        if (expected === undefinedOrError) {
                            return;
                        }
                        throw actualOperation.error;
                    }
                    expect(actualOperation.value).toEqual(
                        expected === undefinedOrError ? undefined : expected
                    );
                });
            };
    }
}

describe.each([Resources.minimumState, Resources.complexState])('tests id', state => {
    const clientOperation: UpOperation = {
        $v: 1,
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
        requestedBy: { type: client, userUid: Resources.Participant.Player1.userUid },
        expected: undefined,
    });
});

describe.each([Resources.minimumState, Resources.complexState])('tests name', state => {
    const newName = 'NEW_NAME';

    const clientOperation: UpOperation = {
        $v: 1,
        name: { newValue: newName },
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

    const expected: TwoWayOperation = {
        $v: 1,
        name: {
            oldValue: state.name,
            newValue: newName,
        },
    };

    tester({ testName: 'tests server', requestedBy: { type: admin }, expected });
    tester({
        testName: 'tests Player',
        requestedBy: { type: client, userUid: Resources.Participant.Player1.userUid },
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

    const clientOperation: UpOperation = {
        $v: 1,
        [key]: { newValue: newName },
    };

    Test.Basic.testServerTransformToReject({
        prevState: Resources.minimumState,
        currentState: Resources.minimumState,
        serverOperation: undefined,
        clientOperation,
    });

    const tester = Test.Basic.setupTestServerTransform({
        prevState: Resources.minimumState,
        currentState: Resources.minimumState,
        serverOperation: undefined,
        clientOperation,
    });

    const expected: TwoWayOperation = {
        $v: 1,
        [key]: {
            oldValue: Resources.minimumState[key],
            newValue: newName,
        },
    };

    tester({ testName: 'tests server', requestedBy: { type: admin }, expected });
    tester({
        testName: 'tests Player',
        requestedBy: { type: client, userUid: Resources.Participant.Player1.userUid },
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
`('tests bgm', ({ id, isValidId }: { id: string; isValidId: boolean }) => {
    const newValue = {
        $v: 1 as const,
        files: [
            {
                $v: 1 as const,
                sourceType: 'Default' as const,
                path: 'PATH',
            },
        ],
        volume: 0.5,
        isPaused: false,
    };

    const clientOperation: UpOperation = {
        $v: 1,
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
        prevState: Resources.minimumState,
        currentState: Resources.minimumState,
        serverOperation: undefined,
        clientOperation,
    });

    const tester = Test.Basic.setupTestServerTransform({
        prevState: Resources.minimumState,
        currentState: Resources.minimumState,
        serverOperation: undefined,
        clientOperation,
    });

    const expected: TwoWayOperation | typeof undefinedOrError = isValidId
        ? {
              $v: 1,
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
        requestedBy: { type: client, userUid: Resources.Participant.Player1.userUid },
        expected,
    });
});

describe('tests creating DicePieceValue', () => {
    const characterKey = 'CHARACTER_KEY';
    const dicePieceValueKey = 'DICE_KEY';

    const state: State = {
        ...Resources.minimumState,
        participants: {
            ...Resources.minimumState.participants,
            [Resources.Participant.Player1.userUid]: {
                $v: 1,
                name: 'PARTICIPANT_NAME',
                role: 'Player',
                boards: {},
                characters: {
                    [characterKey]: Resources.Character.emptyState,
                },
                imagePieceValues: {},
            },
        },
    };

    const clientOperation: UpOperation = {
        $v: 1,
        participants: {
            [Resources.Participant.Player1.userUid]: {
                type: update,
                update: {
                    $v: 1,
                    characters: {
                        [characterKey]: {
                            type: update,
                            update: {
                                $v: 1,
                                dicePieceValues: {
                                    [dicePieceValueKey]: {
                                        type: replace,
                                        replace: {
                                            newValue: {
                                                $v: 1,
                                                dice: {
                                                    '1': {
                                                        $v: 1,
                                                        dieType: 'D6',
                                                        value: 1,
                                                        isValuePrivate: false,
                                                    },
                                                },
                                                pieces: {},
                                            },
                                        },
                                    },
                                },
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

    const expected: TwoWayOperation = {
        $v: 1,
        participants: {
            [Resources.Participant.Player1.userUid]: {
                type: update,
                update: {
                    $v: 1,
                    characters: {
                        [characterKey]: {
                            type: update,
                            update: {
                                $v: 1,
                                dicePieceValues: {
                                    [dicePieceValueKey]: {
                                        type: replace,
                                        replace: {
                                            newValue: {
                                                $v: 1,
                                                dice: {
                                                    '1': {
                                                        $v: 1,
                                                        dieType: 'D6',
                                                        value: 1,
                                                        isValuePrivate: false,
                                                    },
                                                },
                                                pieces: {},
                                            },
                                        },
                                    },
                                },
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
        requestedBy: { type: client, userUid: Resources.Participant.Player1.userUid },
        expected,
    });
    tester({
        testName: 'tests Non-owner Player',
        requestedBy: { type: client, userUid: Resources.Participant.Player2.userUid },
        expected: undefined,
    });
});

describe('tests creating Character', () => {
    const characterKey = 'CHARACTER_KEY';

    const state: State = Resources.minimumState;

    const clientOperation: UpOperation = {
        $v: 1,
        participants: {
            [Resources.Participant.Player1.userUid]: {
                type: update,
                update: {
                    $v: 1,
                    characters: {
                        [characterKey]: {
                            type: replace,
                            replace: {
                                newValue: Resources.Character.emptyState,
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

    const expected: TwoWayOperation = {
        $v: 1,
        participants: {
            [Resources.Participant.Player1.userUid]: {
                type: update,
                update: {
                    $v: 1,
                    characters: {
                        [characterKey]: {
                            type: replace,
                            replace: {
                                newValue: Resources.Character.emptyState,
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
        requestedBy: { type: client, userUid: Resources.Participant.Player1.userUid },
        expected,
    });
    tester({
        testName: 'tests Non-owner Player',
        requestedBy: { type: client, userUid: Resources.Participant.Player2.userUid },
        expected: undefined,
    });
});

describe.each([[true], [false]])(
    'tests updating Character when isPrivate === %o',
    (isPrivate: boolean) => {
        const characterKey = 'CHARACTER_KEY';
        const newName = 'NEW_NAME';

        const state: State = {
            ...Resources.minimumState,
            participants: {
                ...Resources.minimumState.participants,
                [Resources.Participant.Player1.userUid]: {
                    $v: 1,
                    name: 'PARTICIPANT_NAME',
                    role: 'Player',
                    boards: {},
                    characters: {
                        [characterKey]: {
                            ...Resources.Character.emptyState,
                            isPrivate,
                        },
                    },
                    imagePieceValues: {},
                },
            },
        };

        const clientOperation: UpOperation = {
            $v: 1,
            participants: {
                [Resources.Participant.Player1.userUid]: {
                    type: update,
                    update: {
                        $v: 1,
                        characters: {
                            [characterKey]: {
                                type: update,
                                update: {
                                    $v: 1,
                                    name: { newValue: newName },
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

        const expected: TwoWayOperation = {
            $v: 1,
            participants: {
                [Resources.Participant.Player1.userUid]: {
                    type: update,
                    update: {
                        $v: 1,
                        characters: {
                            [characterKey]: {
                                type: update,
                                update: {
                                    $v: 1,
                                    name: {
                                        oldValue: Resources.Character.emptyState.name,
                                        newValue: newName,
                                    },
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
            requestedBy: { type: client, userUid: Resources.Participant.Player1.userUid },
            expected,
        });
        tester({
            testName: 'tests Non-owner Player',
            requestedBy: { type: client, userUid: Resources.Participant.Player2.userUid },
            expected: isPrivate ? undefined : expected,
        });
    }
);

describe.each([[true], [false]])(
    'tests deleting Character when isPrivate === %o',
    (isPrivate: boolean) => {
        const characterKey = 'CHARACTER_KEY';

        const state: State = {
            ...Resources.minimumState,
            participants: {
                ...Resources.minimumState.participants,
                [Resources.Participant.Player1.userUid]: {
                    $v: 1,
                    name: Resources.Participant.Player1.name,
                    role: 'Player',
                    boards: {},
                    characters: {
                        [characterKey]: {
                            ...Resources.Character.emptyState,
                            isPrivate,
                        },
                    },
                    imagePieceValues: {},
                },
            },
        };

        const clientOperation: UpOperation = {
            $v: 1,
            participants: {
                [Resources.Participant.Player1.userUid]: {
                    type: update,
                    update: {
                        $v: 1,
                        characters: {
                            [characterKey]: {
                                type: replace,
                                replace: {
                                    newValue: undefined,
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

        const expected: TwoWayOperation = {
            $v: 1,
            participants: {
                [Resources.Participant.Player1.userUid]: {
                    type: update,
                    update: {
                        $v: 1,
                        characters: {
                            [characterKey]: {
                                type: replace,
                                replace: {
                                    oldValue: {
                                        ...Resources.Character.emptyState,
                                        isPrivate,
                                    },
                                    newValue: undefined,
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
            requestedBy: { type: client, userUid: Resources.Participant.Player1.userUid },
            expected,
        });
        tester({
            testName: 'tests Non-owner Player',
            requestedBy: { type: client, userUid: Resources.Participant.Player2.userUid },
            expected: isPrivate ? undefined : expected,
        });
    }
);
