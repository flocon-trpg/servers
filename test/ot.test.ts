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
    StrIndex10,
} from '../src';
import { Resources } from './resources';
import * as TextOperation from '../src/internal/ot/util/textOperation';

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
        $v: 2,
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
        $v: 2,
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

    const expected: TwoWayOperation = {
        $v: 2,
        name: TextOperation.diff({ prev: state.name, next: newName }),
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
        $v: 2,
        [key]: textUpDiff({ prev: Resources.minimumState[key], next: newName }),
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
        $v: 2,
        [key]: TextOperation.diff({
            prev: Resources.minimumState[key],
            next: newName,
        }),
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
        $v: 2,
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
              $v: 2,
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
                $v: 2,
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
        $v: 2,
        participants: {
            [Resources.Participant.Player1.userUid]: {
                type: update,
                update: {
                    $v: 2,
                    characters: {
                        [characterKey]: {
                            type: update,
                            update: {
                                $v: 2,
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
        $v: 2,
        participants: {
            [Resources.Participant.Player1.userUid]: {
                type: update,
                update: {
                    $v: 2,
                    characters: {
                        [characterKey]: {
                            type: update,
                            update: {
                                $v: 2,
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
        $v: 2,
        participants: {
            [Resources.Participant.Player1.userUid]: {
                type: update,
                update: {
                    $v: 2,
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
        $v: 2,
        participants: {
            [Resources.Participant.Player1.userUid]: {
                type: update,
                update: {
                    $v: 2,
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
                    $v: 2,
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
            $v: 2,
            participants: {
                [Resources.Participant.Player1.userUid]: {
                    type: update,
                    update: {
                        $v: 2,
                        characters: {
                            [characterKey]: {
                                type: update,
                                update: {
                                    $v: 2,
                                    name: textUpDiff({
                                        prev: Resources.Character.emptyState.name,
                                        next: newName,
                                    }),
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
            $v: 2,
            participants: {
                [Resources.Participant.Player1.userUid]: {
                    type: update,
                    update: {
                        $v: 2,
                        characters: {
                            [characterKey]: {
                                type: update,
                                update: {
                                    $v: 2,
                                    name: TextOperation.diff({
                                        prev: Resources.Character.emptyState.name,
                                        next: newName,
                                    }),
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
                    $v: 2,
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
            $v: 2,
            participants: {
                [Resources.Participant.Player1.userUid]: {
                    type: update,
                    update: {
                        $v: 2,
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
            $v: 2,
            participants: {
                [Resources.Participant.Player1.userUid]: {
                    type: update,
                    update: {
                        $v: 2,
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
