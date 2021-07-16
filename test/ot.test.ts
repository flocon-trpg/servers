import { StrIndex10 } from '@kizahasi/util';
import {
    State,
    UpOperation,
    Player,
    Spectator,
    serverTransform,
    TwoWayOperation,
    client,
    RequestedBy,
    server,
    replace,
    CharacterState,
    update,
    diff,
} from '../dist/index';

namespace Resources {
    export namespace Participant {
        export namespace Spectator {
            export const userUid = 'SPECTATOR';
            export const name = 'SPECTATOR_NAME';
        }

        export namespace Player1 {
            export const userUid = 'PLAYER1';
            export const name = 'PLAYER1_NAME';
        }

        export namespace Player2 {
            export const userUid = 'PLAYER2';
            export const name = 'PLAYER2_NAME';
        }

        export namespace Null {
            export const userUid = 'NULL_PARTICIPANT';
            export const name = 'NULL_PARTICIPANT_NAME';
        }

        export namespace None {
            export const userUid = 'NONE_PARTICIPANT';
        }
    }

    export namespace Character {
        export const emptyState: CharacterState = {
            $version: 1,
            memo: '',
            name: '',
            image: undefined,
            privateVarToml: '',
            privateCommand: '',
            privateCommands: {},
            tachieImage: undefined,
            isPrivate: false,
            boolParams: {},
            numParams: {},
            numMaxParams: {},
            strParams: {},
            dicePieceValues: {},
            numberPieceValues: {},
            pieces: {},
            tachieLocations: {},
        };
    }

    export const minimumState: State = {
        $version: 1,
        activeBoardKey: null,
        createdBy: 'CREATED_BY',
        name: 'ROOM_NAME',
        bgms: {},
        boards: {},
        characters: {},
        participants: {
            [Participant.Player1.userUid]: {
                $version: 1,
                name: Participant.Player1.name,
                role: Player,
            },
            [Participant.Player2.userUid]: {
                $version: 1,
                name: Participant.Player2.name,
                role: Player,
            },
            [Participant.Spectator.userUid]: {
                $version: 1,
                name: Participant.Spectator.name,
                role: Spectator,
            },
            [Participant.Null.userUid]: {
                $version: 1,
                name: Participant.Null.name,
                role: null,
            },
        },
        boolParamNames: {},
        numParamNames: {},
        strParamNames: {},
        memos: {},
        publicChannel1Name: '',
        publicChannel2Name: '',
        publicChannel3Name: '',
        publicChannel4Name: '',
        publicChannel5Name: '',
        publicChannel6Name: '',
        publicChannel7Name: '',
        publicChannel8Name: '',
        publicChannel9Name: '',
        publicChannel10Name: '',
    };

    export const complexState: State = {
        $version: 1,
        activeBoardKey: null,
        createdBy: 'CREATED_BY',
        name: 'ROOM_NAME',
        bgms: {
            '1': {
                $version: 1,
                isPaused: false,
                files: [{ $version: 1, path: 'BGM_FILE_PATH', sourceType: 'Default' }],
                volume: 1,
            },
        },
        boards: {
            BOARD_CREATED_BY: {
                BOARD_ID: {
                    $version: 1,
                    backgroundImage: {
                        $version: 1,
                        path: 'BOARD_IMAGE_PATH',
                        sourceType: 'Default',
                    },
                    backgroundImageZoom: 1,
                    cellColumnCount: 10,
                    cellHeight: 10,
                    cellOffsetX: 10,
                    cellOffsetY: 10,
                    cellRowCount: 10,
                    cellWidth: 10,
                    name: 'BOARD_NAME',
                    imagePieces: {},
                },
            },
        },
        characters: {
            CHARA_FIRST_KEY: {
                CHARA_SECOND_KEY: {
                    $version: 1,
                    image: {
                        $version: 1,
                        path: 'CHARA_IMAGE_PATH',
                        sourceType: 'Default',
                    },
                    isPrivate: false,
                    memo: 'CHARA_MEMO',
                    name: 'CHARA_NAME',
                    privateCommand: 'CHARA_PRIVATE_COMMAND',
                    privateCommands: {},
                    privateVarToml: '',
                    tachieImage: {
                        $version: 1,
                        path: 'TACHIE_IMAGE_PATH',
                        sourceType: 'Default',
                    },
                    boolParams: {
                        '1': {
                            $version: 1,
                            isValuePrivate: false,
                            value: false,
                        },
                    },
                    numParams: {
                        '1': {
                            $version: 1,
                            isValuePrivate: false,
                            value: 10,
                        },
                    },
                    numMaxParams: {
                        '1': {
                            $version: 1,
                            isValuePrivate: false,
                            value: 20,
                        },
                    },
                    strParams: {
                        '1': {
                            $version: 1,
                            isValuePrivate: false,
                            value: 'STR_PARAM_VALUE',
                        },
                    },
                    pieces: {
                        CHARA_PIECE_FIRST_KEY: {
                            CHARA_PIECE_SECOND_KEY: {
                                $version: 1,
                                cellH: 1,
                                cellW: 2,
                                cellX: 3,
                                cellY: 4,
                                isCellMode: false,
                                isPrivate: false,
                                h: 5,
                                w: 6,
                                x: 7,
                                y: 8,
                            },
                        },
                    },
                    tachieLocations: {
                        TACHIE_LOCATION_FIRST_KEY: {
                            TACHIE_LOCATION_SECOND_KEY: {
                                $version: 1,
                                isPrivate: false,
                                h: 5,
                                w: 6,
                                x: 7,
                                y: 8,
                            },
                        },
                    },
                    dicePieceValues: {
                        DICE_PIECE_KEY: {
                            $version: 1,
                            dice: {
                                '1': {
                                    $version: 1,
                                    dieType: 'D6',
                                    isValuePrivate: false,
                                    value: 3,
                                },
                            },
                            pieces: {
                                DICE_PIECE_FIRST_KEY: {
                                    DICE_PIECE_SECOND_KEY: {
                                        $version: 1,
                                        cellH: 1,
                                        cellW: 2,
                                        cellX: 3,
                                        cellY: 4,
                                        isCellMode: false,
                                        isPrivate: false,
                                        h: 5,
                                        w: 6,
                                        x: 7,
                                        y: 8,
                                    },
                                },
                            },
                        },
                    },
                    numberPieceValues: {
                        NUM_PIECE_KEY: {
                            $version: 1,
                            isValuePrivate: false,
                            value: 1,
                            pieces: {
                                DICE_PIECE_FIRST_KEY: {
                                    DICE_PIECE_SECOND_KEY: {
                                        $version: 1,
                                        cellH: 1,
                                        cellW: 2,
                                        cellX: 3,
                                        cellY: 4,
                                        isCellMode: false,
                                        isPrivate: false,
                                        h: 5,
                                        w: 6,
                                        x: 7,
                                        y: 8,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        participants: minimumState.participants,
        boolParamNames: {
            '1': {
                $version: 1,
                name: 'BOOL_PARAM_NAME',
            },
        },
        numParamNames: {
            '1': {
                $version: 1,
                name: 'NUM_PARAM_NAME',
            },
        },
        strParamNames: {
            '1': {
                $version: 1,
                name: 'STR_PARAM_NAME',
            },
        },
        memos: {
            MEMO_ID: {
                $version: 1,
                name: 'MEMO_NAME',
                dir: ['MEMO_DIR'],
                text: 'MEMO_TEXT',
                textType: 'Plain',
            },
        },
        publicChannel1Name: '',
        publicChannel2Name: '',
        publicChannel3Name: '',
        publicChannel4Name: '',
        publicChannel5Name: '',
        publicChannel6Name: '',
        publicChannel7Name: '',
        publicChannel8Name: '',
        publicChannel9Name: '',
        publicChannel10Name: '',
    };
}

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
                expected: TwoWayOperation | undefined;
            }) => {
                it(testName, () => {
                    const actualOperation = serverTransform(requestedBy)({
                        prevState,
                        currentState,
                        serverOperation,
                        clientOperation,
                    });
                    if (actualOperation.isError) {
                        fail('expected not to be an error');
                    }
                    expect(actualOperation.value).toEqual(expected);
                });
            };
    }
}

describe.each([Resources.minimumState, Resources.complexState])('tests id', state => {
    const clientOperation: UpOperation = {
        $version: 1,
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

    tester({ testName: 'tests server', requestedBy: { type: server }, expected: undefined });
    tester({
        testName: 'tests Player',
        requestedBy: { type: client, userUid: Resources.Participant.Player1.userUid },
        expected: undefined,
    });
});

describe.each([Resources.minimumState, Resources.complexState])('tests name', state => {
    const newName = 'NEW_NAME';

    const clientOperation: UpOperation = {
        $version: 1,
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
        $version: 1,
        name: {
            oldValue: state.name,
            newValue: newName,
        },
    };

    tester({ testName: 'tests server', requestedBy: { type: server }, expected });
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
        $version: 1,
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
        $version: 1,
        [key]: {
            oldValue: Resources.minimumState[key],
            newValue: newName,
        },
    };

    tester({ testName: 'tests server', requestedBy: { type: server }, expected });
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
        $version: 1 as const,
        files: [
            {
                $version: 1 as const,
                sourceType: 'Default' as const,
                path: 'PATH',
            },
        ],
        volume: 0.5,
        isPaused: false,
    };

    const clientOperation: UpOperation = {
        $version: 1,
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

    const expected: TwoWayOperation | undefined = isValidId
        ? {
              $version: 1,
              bgms: {
                  [id]: {
                      type: replace,
                      replace: {
                          newValue,
                      },
                  },
              },
          }
        : undefined;

    tester({ testName: 'tests server', requestedBy: { type: server }, expected });
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
        characters: {
            [Resources.Participant.Player1.userUid]: {
                [characterKey]: Resources.Character.emptyState,
            },
        },
    };

    const clientOperation: UpOperation = {
        $version: 1,
        characters: {
            [Resources.Participant.Player1.userUid]: {
                [characterKey]: {
                    type: update,
                    update: {
                        $version: 1,
                        dicePieceValues: {
                            [dicePieceValueKey]: {
                                type: replace,
                                replace: {
                                    newValue: {
                                        $version: 1,
                                        dice: {
                                            '1': {
                                                $version: 1,
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
        $version: 1,
        characters: {
            [Resources.Participant.Player1.userUid]: {
                [characterKey]: {
                    type: update,
                    update: {
                        $version: 1,
                        dicePieceValues: {
                            [dicePieceValueKey]: {
                                type: replace,
                                replace: {
                                    newValue: {
                                        $version: 1,
                                        dice: {
                                            '1': {
                                                $version: 1,
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
    };

    tester({ testName: 'tests server', requestedBy: { type: server }, expected });
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
        $version: 1,
        characters: {
            [Resources.Participant.Player1.userUid]: {
                [characterKey]: {
                    type: replace,
                    replace: {
                        newValue: Resources.Character.emptyState,
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
        $version: 1,
        characters: {
            [Resources.Participant.Player1.userUid]: {
                [characterKey]: {
                    type: replace,
                    replace: {
                        newValue: Resources.Character.emptyState,
                    },
                },
            },
        },
    };

    tester({ testName: 'tests server', requestedBy: { type: server }, expected });
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
            characters: {
                [Resources.Participant.Player1.userUid]: {
                    [characterKey]: {
                        ...Resources.Character.emptyState,
                        isPrivate,
                    },
                },
            },
        };

        const clientOperation: UpOperation = {
            $version: 1,
            characters: {
                [Resources.Participant.Player1.userUid]: {
                    [characterKey]: {
                        type: update,
                        update: {
                            $version: 1,
                            name: { newValue: newName },
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
            $version: 1,
            characters: {
                [Resources.Participant.Player1.userUid]: {
                    [characterKey]: {
                        type: update,
                        update: {
                            $version: 1,
                            name: {
                                oldValue: Resources.Character.emptyState.name,
                                newValue: newName,
                            },
                        },
                    },
                },
            },
        };

        tester({ testName: 'tests server', requestedBy: { type: server }, expected });
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
            characters: {
                [Resources.Participant.Player1.userUid]: {
                    [characterKey]: {
                        ...Resources.Character.emptyState,
                        isPrivate,
                    },
                },
            },
        };

        const clientOperation: UpOperation = {
            $version: 1,
            characters: {
                [Resources.Participant.Player1.userUid]: {
                    [characterKey]: {
                        type: replace,
                        replace: {
                            newValue: undefined,
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
            $version: 1,
            characters: {
                [Resources.Participant.Player1.userUid]: {
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
        };

        tester({ testName: 'tests server', requestedBy: { type: server }, expected });
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

it.each([Resources.minimumState, Resources.complexState])('tests diff of no change', state => {
    const diffResult = diff({ prevState: state, nextState: state });
    expect(diffResult).toBeUndefined();
});
