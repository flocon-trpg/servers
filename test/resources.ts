import { State, Player, Spectator, CharacterState } from '../src';

export namespace Resources {
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
                imagePieceValues: {},
            },
            [Participant.Player2.userUid]: {
                $version: 1,
                name: Participant.Player2.name,
                role: Player,
                imagePieceValues: {},
            },
            [Participant.Spectator.userUid]: {
                $version: 1,
                name: Participant.Spectator.name,
                role: Spectator,
                imagePieceValues: {},
            },
            [Participant.Null.userUid]: {
                $version: 1,
                name: Participant.Null.name,
                role: null,
                imagePieceValues: {},
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
