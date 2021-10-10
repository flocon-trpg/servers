import { State, Player, Spectator, CharacterState } from '../src';
import { forceMaxLength100String } from './forceMaxLength100String';

export namespace Resources {
    const boardId = 'BOARD_ID';

    export namespace Participant {
        export namespace Spectator {
            export const userUid = 'SPECTATOR';
            export const name = forceMaxLength100String('SPECTATOR_NAME');
        }

        export namespace Player1 {
            export const userUid = 'PLAYER1';
            export const name = forceMaxLength100String('PLAYER1_NAME');
        }

        export namespace Player2 {
            export const userUid = 'PLAYER2';
            export const name = forceMaxLength100String('PLAYER2_NAME');
        }

        export namespace Null {
            export const userUid = 'NULL_PARTICIPANT';
            export const name = forceMaxLength100String('NULL_PARTICIPANT_NAME');
        }

        export namespace None {
            export const userUid = 'NONE_PARTICIPANT';
        }
    }

    export namespace Character {
        export const emptyState: CharacterState = {
            $v: 1,
            $r: 2,
            chatPalette: '',
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
            stringPieceValues: {},
            pieces: {},
            tachieLocations: {},
        };
    }

    export const minimumState: State = {
        $r: 2,
        activeBoardKey: null,
        createdBy: 'CREATED_BY',
        name: 'ROOM_NAME',
        bgms: {},
        participants: {
            [Participant.Player1.userUid]: {
                $v: 1,
                $r: 2,
                name: Participant.Player1.name,
                role: Player,
                boards: {},
                characters: {},
                imagePieceValues: {},
            },
            [Participant.Player2.userUid]: {
                $v: 1,
                $r: 2,
                name: Participant.Player2.name,
                role: Player,
                boards: {},
                characters: {},
                imagePieceValues: {},
            },
            [Participant.Spectator.userUid]: {
                $v: 1,
                $r: 2,
                name: Participant.Spectator.name,
                role: Spectator,
                boards: {},
                characters: {},
                imagePieceValues: {},
            },
            [Participant.Null.userUid]: {
                $v: 1,
                $r: 2,
                name: Participant.Null.name,
                role: null,
                boards: {},
                characters: {},
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
        $r: 2,
        activeBoardKey: null,
        createdBy: 'CREATED_BY',
        name: 'ROOM_NAME',
        bgms: {
            '1': {
                $v: 1,
                $r: 1,
                isPaused: false,
                files: [
                    {
                        $v: 1,
                        $r: 1,
                        path: 'BGM_FILE_PATH',
                        sourceType: 'Default',
                    },
                ],
                volume: 1,
            },
        },
        participants: {
            ...minimumState.participants,
            [Participant.Player1.userUid]: {
                $v: 1,
                $r: 2,
                name: Participant.Player1.name,
                role: 'Player',
                boards: {
                    [boardId]: {
                        $v: 1,
                        $r: 1,
                        backgroundImage: {
                            $v: 1,
                            $r: 1,
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
                characters: {},
                imagePieceValues: {},
            },
            [Participant.Player2.userUid]: {
                $v: 1,
                $r: 2,
                name: Participant.Player2.name,
                role: 'Player',
                boards: {},
                characters: {
                    CHARACTER_ID: {
                        $v: 1,
                        $r: 2,
                        image: {
                            $v: 1,
                            $r: 1,
                            path: 'CHARA_IMAGE_PATH',
                            sourceType: 'Default',
                        },
                        isPrivate: false,
                        chatPalette: '',
                        memo: 'CHARA_MEMO',
                        name: 'CHARA_NAME',
                        privateCommand: 'CHARA_PRIVATE_COMMAND',
                        privateCommands: {},
                        privateVarToml: '',
                        tachieImage: {
                            $v: 1,
                            $r: 1,
                            path: 'TACHIE_IMAGE_PATH',
                            sourceType: 'Default',
                        },
                        boolParams: {
                            '1': {
                                $v: 1,
                                $r: 1,
                                isValuePrivate: false,
                                value: false,
                            },
                        },
                        numParams: {
                            '1': {
                                $v: 1,
                                $r: 1,
                                isValuePrivate: false,
                                value: 10,
                            },
                        },
                        numMaxParams: {
                            '1': {
                                $v: 1,
                                $r: 1,
                                isValuePrivate: false,
                                value: 20,
                            },
                        },
                        strParams: {
                            '1': {
                                $r: 1,
                                isValuePrivate: false,
                                value: 'STR_PARAM_VALUE',
                            },
                        },
                        pieces: {
                            CHARA_PIECE_FIRST_KEY: {
                                CHARA_PIECE_SECOND_KEY: {
                                    $v: 1,
                                    $r: 1,
                                    boardKey: {
                                        createdBy: Participant.Player1.userUid,
                                        id: boardId,
                                    },
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
                                    $v: 1,
                                    $r: 1,
                                    boardKey: {
                                        createdBy: Participant.Player1.userUid,
                                        id: boardId,
                                    },
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
                                $v: 1,
                                $r: 1,
                                dice: {
                                    '1': {
                                        $v: 1,
                                        $r: 1,
                                        dieType: 'D6',
                                        isValuePrivate: false,
                                        value: 3,
                                    },
                                },
                                pieces: {
                                    DICE_PIECE_FIRST_KEY: {
                                        DICE_PIECE_SECOND_KEY: {
                                            $v: 1,
                                            $r: 1,
                                            boardKey: {
                                                createdBy: Participant.Player1.userUid,
                                                id: boardId,
                                            },
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
                        stringPieceValues: {
                            STR_PIECE_KEY: {
                                $v: 1,
                                $r: 1,
                                isValuePrivate: false,
                                value: 'STR_PIECE_VALUE',
                                pieces: {
                                    DICE_PIECE_FIRST_KEY: {
                                        DICE_PIECE_SECOND_KEY: {
                                            $v: 1,
                                            $r: 1,
                                            boardKey: {
                                                createdBy: Participant.Player1.userUid,
                                                id: boardId,
                                            },
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
                imagePieceValues: {},
            },
        },
        boolParamNames: {
            '1': {
                $v: 1,
                $r: 1,
                name: 'BOOL_PARAM_NAME',
            },
        },
        numParamNames: {
            '1': {
                $v: 1,
                $r: 1,
                name: 'NUM_PARAM_NAME',
            },
        },
        strParamNames: {
            '1': {
                $v: 1,
                $r: 1,
                name: 'STR_PARAM_NAME',
            },
        },
        memos: {
            MEMO_ID: {
                $v: 1,
                $r: 1,
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
