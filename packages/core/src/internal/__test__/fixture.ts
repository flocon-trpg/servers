import {
    Player,
    Spectator,
    State,
    boardTemplate,
    characterTemplate,
    forceMaxLength100String,
    roomDbTemplate,
    roomTemplate,
} from '../..';

export namespace Fixture {
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

    export namespace Board {
        export const emptyState = (
            ownerParticipantId: string | undefined
        ): State<typeof boardTemplate> => ({
            $v: 2,
            $r: 1,
            backgroundImage: undefined,
            backgroundImageZoom: 1,
            cellColumnCount: 0,
            cellHeight: 0,
            cellOffsetX: 0,
            cellOffsetY: 0,
            cellRowCount: 0,
            cellWidth: 0,
            dicePieces: {},
            imagePieces: {},
            name: '',
            ownerParticipantId,
            shapePieces: {},
            stringPieces: {},
        });
    }

    export namespace Character {
        export const emptyState = (
            ownerParticipantId: string | undefined
        ): State<typeof characterTemplate> => ({
            $v: 2,
            $r: 1,
            chatPalette: '',
            memo: '',
            name: '',
            image: undefined,
            hasTag1: false,
            hasTag2: false,
            hasTag3: false,
            hasTag4: false,
            hasTag5: false,
            hasTag6: false,
            hasTag7: false,
            hasTag8: false,
            hasTag9: false,
            hasTag10: false,
            privateVarToml: '',
            privateCommands: {},
            portraitImage: undefined,
            isPrivate: false,
            boolParams: {},
            numParams: {},
            numMaxParams: {},
            strParams: {},
            pieces: {},
            portraitPieces: {},
            ownerParticipantId,
        });
    }

    export const minimumState: State<typeof roomTemplate> = {
        $v: 2,
        $r: 1,
        activeBoardId: undefined,
        createdBy: 'CREATED_BY',
        name: 'ROOM_NAME',
        bgms: {},
        boards: {},
        characters: {},
        participants: {
            [Participant.Player1.userUid]: {
                $v: 2,
                $r: 1,
                name: Participant.Player1.name,
                role: Player,
            },
            [Participant.Player2.userUid]: {
                $v: 2,
                $r: 1,
                name: Participant.Player2.name,
                role: Player,
            },
            [Participant.Spectator.userUid]: {
                $v: 2,
                $r: 1,
                name: Participant.Spectator.name,
                role: Spectator,
            },
            [Participant.Null.userUid]: {
                $v: 2,
                $r: 1,
                name: Participant.Null.name,
                role: undefined,
            },
        },
        boolParamNames: {},
        numParamNames: {},
        strParamNames: {},
        memos: {},
        rollCalls: {},
        characterTag1Name: undefined,
        characterTag2Name: undefined,
        characterTag3Name: undefined,
        characterTag4Name: undefined,
        characterTag5Name: undefined,
        characterTag6Name: undefined,
        characterTag7Name: undefined,
        characterTag8Name: undefined,
        characterTag9Name: undefined,
        characterTag10Name: undefined,
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

    export const complexDbState: State<typeof roomDbTemplate> = {
        $v: 2,
        $r: 1,
        activeBoardId: undefined,
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
        boards: {
            [boardId]: {
                $v: 2,
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
                dicePieces: {
                    DICE_PIECE_KEY: {
                        $v: 2,
                        $r: 1,
                        cellH: 1,
                        cellW: 2,
                        cellX: 3,
                        cellY: 4,
                        isCellMode: false,
                        isPositionLocked: false,
                        opacity: undefined,
                        h: 5,
                        w: 6,
                        x: 7,
                        y: 8,
                        name: undefined,
                        memo: undefined,
                        dice: {
                            '1': {
                                $v: 1,
                                $r: 1,
                                dieType: 'D6',
                                isValuePrivate: false,
                                value: 3,
                            },
                        },
                        ownerCharacterId: Participant.Player2.userUid,
                    },
                },
                imagePieces: {},
                name: 'BOARD_NAME',
                ownerParticipantId: Participant.Player1.userUid,
                shapePieces: {},
                stringPieces: {
                    STR_PIECE_KEY: {
                        $v: 2,
                        $r: 1,
                        cellH: 1,
                        cellW: 2,
                        cellX: 3,
                        cellY: 4,
                        isCellMode: false,
                        isPositionLocked: false,
                        opacity: undefined,
                        h: 5,
                        w: 6,
                        x: 7,
                        y: 8,
                        isValuePrivate: false,
                        value: 'STR_PIECE_VALUE',
                        valueInputType: undefined,
                        name: undefined,
                        memo: undefined,
                        ownerCharacterId: Participant.Player2.userUid,
                    },
                },
            },
        },
        characters: {
            CHARACTER_ID: {
                $v: 2,
                $r: 1,
                ownerParticipantId: Participant.Player1.userUid,
                hasTag1: false,
                hasTag2: false,
                hasTag3: false,
                hasTag4: false,
                hasTag5: false,
                hasTag6: false,
                hasTag7: false,
                hasTag8: false,
                hasTag9: false,
                hasTag10: false,
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
                privateCommands: {},
                privateVarToml: '',
                portraitImage: {
                    $v: 1,
                    $r: 1,
                    path: 'PORTRAIT_IMAGE_PATH',
                    sourceType: 'Default',
                },
                boolParams: {
                    '1': {
                        $v: 2,
                        $r: 1,
                        isValuePrivate: false,
                        value: false,
                        overriddenParameterName: undefined,
                    },
                },
                numParams: {
                    '1': {
                        $v: 2,
                        $r: 1,
                        isValuePrivate: false,
                        value: 10,
                        overriddenParameterName: undefined,
                    },
                },
                numMaxParams: {
                    '1': {
                        $v: 2,
                        $r: 1,
                        isValuePrivate: false,
                        value: 20,
                        overriddenParameterName: undefined,
                    },
                },
                strParams: {
                    '1': {
                        $v: 2,
                        $r: 1,
                        isValuePrivate: false,
                        value: 'STR_PARAM_VALUE',
                        overriddenParameterName: undefined,
                    },
                },
                pieces: {
                    CHARA_PIECE_KEY: {
                        $v: 2,
                        $r: 1,
                        boardId,
                        cellH: 1,
                        cellW: 2,
                        cellX: 3,
                        cellY: 4,
                        isCellMode: false,
                        isPositionLocked: false,
                        isPrivate: false,
                        opacity: undefined,
                        memo: undefined,
                        name: undefined,
                        h: 5,
                        w: 6,
                        x: 7,
                        y: 8,
                    },
                },
                portraitPieces: {
                    PORTRAIT_LOCATION: {
                        $v: 2,
                        $r: 1,
                        boardId,
                        isPositionLocked: false,
                        isPrivate: false,
                        opacity: undefined,
                        memo: undefined,
                        name: undefined,
                        h: 5,
                        w: 6,
                        x: 7,
                        y: 8,
                    },
                },
            },
        },
        characterTag1Name: undefined,
        characterTag2Name: undefined,
        characterTag3Name: undefined,
        characterTag4Name: undefined,
        characterTag5Name: undefined,
        characterTag6Name: undefined,
        characterTag7Name: undefined,
        characterTag8Name: undefined,
        characterTag9Name: undefined,
        characterTag10Name: undefined,
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
        rollCalls: {
            ROLL_CALL_ID: {
                $v: 1,
                $r: 1,
                createdAt: 1_000_000_000,
                createdBy: Participant.Player1.userUid,
                closeStatus: undefined,
                participants: {
                    [Participant.Player1.userUid]: {
                        $v: 1,
                        $r: 1,
                        answeredAt: 1_000_000_000,
                    },
                    [Participant.Player2.userUid]: {
                        $v: 1,
                        $r: 1,
                        answeredAt: undefined,
                    },
                },
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

    export const complexState: State<typeof roomTemplate> = {
        ...complexDbState,
        createdBy: 'CREATED_BY',
        name: 'ROOM_NAME',
        participants: {
            ...minimumState.participants,
            [Participant.Player1.userUid]: {
                $v: 2,
                $r: 1,
                name: Participant.Player1.name,
                role: 'Player',
            },
            [Participant.Player2.userUid]: {
                $v: 2,
                $r: 1,
                name: Participant.Player2.name,
                role: 'Player',
            },
        },
    };
}
