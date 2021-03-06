import { Auth, Config, IdTokenResult, Unsubscribe, User } from 'firebase/auth';
import { $free, ParticipantRole, boardTemplate, forceMaxLength100String } from '@flocon-trpg/core';
import {
    RoomMessages,
    RoomPrivateMessage,
    RoomPublicMessage,
} from '@flocon-trpg/typed-document-node-v0.7.1';
import { State as S, characterTemplate, roomTemplate } from '@flocon-trpg/core';
import { WebConfig } from '../configType';
import { UserConfig, defaultUserConfig } from '../atoms/userConfigAtom/types';
import { FirebaseStorage } from '@firebase/storage';
import { FirebaseApp } from '@firebase/app';
import { Client, createClient } from '@urql/core';
import ColorName from 'color-name';
import Color from 'color';
import moment from 'moment';

type State = S<typeof roomTemplate>;
type BoardState = S<typeof boardTemplate>;
type CharacterState = S<typeof characterTemplate>;

const myUserUid = 'my-user-uid';
const myParticipantName = 'my-ptc-name';
const anotherPlayerUserUid = 'player-user-uid';
const anotherPlayerParticipantName = 'player-ptc-name1';
const anotherSpectatorUserUid = 'spectator-user-uid';
const anotherSpectatorParticipantName = 'spectator-ptc-name2';
const myDisplayName = 'my-display-name';

export const myRichCharacterId = 'character-id-1';
export const mySimpleCharacterId = 'character-id-2';
export const anotherPlayerCharacterId1 = 'character-id-3';

export const defaultBoardId = 'board-id-1';
export const anotherBoardId = 'board-id-2';

export const dicePieceKey1 = 'dice-piece-1';
export const dicePieceKey2 = 'dice-piece-2';

export const imagePieceKey1 = 'image-piece-1';
export const imagePieceKey2 = 'image-piece-2';

export const stringPieceKey1 = 'string-piece-1';
export const stringPieceKey2 = 'string-piece-2';

const appData: FirebaseApp = {
    name: '',
    options: {},
    automaticDataCollectionEnabled: false,
};

export const firebaseConfigData: Config = {
    apiKey: '',
    authDomain: '',
    apiHost: '',
    apiScheme: '',
    tokenApiHost: '',
    sdkClientVersion: '',
};

export const mockWebConfig: WebConfig = {
    firebaseConfig: {
        apiKey: '',
        appId: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
    },
    isUnlistedFirebaseStorageEnabled: false,
    isPublicFirebaseStorageEnabled: false,
};

export const mockUserConfig: UserConfig = defaultUserConfig(myUserUid);

export const mockAuth: Auth = {
    app: appData,
    name: '',
    config: firebaseConfigData,
    setPersistence: function (): Promise<void> {
        throw new Error('Function not implemented.');
    },
    languageCode: null,
    tenantId: null,
    settings: { appVerificationDisabledForTesting: false },
    onAuthStateChanged: function (): Unsubscribe {
        throw new Error('Function not implemented.');
    },
    onIdTokenChanged: function (): Unsubscribe {
        throw new Error('Function not implemented.');
    },
    currentUser: null,
    emulatorConfig: null,
    updateCurrentUser: function (): Promise<void> {
        throw new Error('Function not implemented.');
    },
    useDeviceLanguage: function (): void {
        throw new Error('Function not implemented.');
    },
    signOut: function (): Promise<void> {
        throw new Error('Function not implemented.');
    },
    beforeAuthStateChanged: function () {
        throw new Error('Function not implemented.');
    },
};

export const mockStorage: FirebaseStorage = {
    app: appData,
    maxUploadRetryTime: 1000,
    maxOperationRetryTime: 1000,
};

const boardBase: BoardState = {
    $v: 2,
    $r: 1,
    ownerParticipantId: undefined,
    name: '',
    backgroundImage: undefined,
    backgroundImageZoom: 1,
    cellColumnCount: 5,
    cellRowCount: 7,
    cellHeight: 50,
    cellWidth: 50,
    cellOffsetX: 0,
    cellOffsetY: 0,
    dicePieces: undefined,
    imagePieces: undefined,
    stringPieces: undefined,
};

const characterBase: CharacterState = {
    $v: 2,
    $r: 1,
    ownerParticipantId: undefined,
    isPrivate: false,
    name: '',
    memo: '',
    image: undefined,
    portraitImage: undefined,
    privateVarToml: '',
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
    chatPalette: '',
    boolParams: undefined,
    numParams: undefined,
    numMaxParams: undefined,
    strParams: undefined,
    pieces: undefined,
    portraitPieces: undefined,
    privateCommands: undefined,
};

export const dummyUrqlOperation = {
    kind: 'query' as const,
    get key(): never {
        throw new Error();
    },
    get context(): never {
        throw new Error();
    },
    get query(): never {
        throw new Error();
    },
};

export type MockUrqlClientParams = {
    mockQuery?: Client['executeQuery'];
};

export const createMockUrqlClient = ({ mockQuery }: MockUrqlClientParams): Client => {
    // https://formidable.com/open-source/urql/docs/advanced/testing/ ?????? executeQuery ??? executeMutation ??? executeSubscription ???????????????????????????????????????????????????????????????????????????query ?????????????????????????????????????????????????????? Client ?????????????????????????????????????????????????????????????????????????????????????????????

    const result = createClient({ url: 'https://localhost/mock-urql-client', exchanges: [] });
    result.executeQuery = query => {
        if (mockQuery == null) {
            throw new Error('mockQuery is not implemented.');
        }
        return mockQuery(query);
    };
    result.executeMutation = (): never => {
        throw new Error('Not implemented.');
    };
    result.executeSubscription = (): never => {
        throw new Error('Not implemented.');
    };
    return result;
};

// https://dummyimage.com/ ????????????????????????????????????????????????????????????
const generateDummyImage = ({
    width,
    height,
    text,
    bgColor,
    textColor,
}: {
    width: number;
    height: number;
    text?: string;
    bgColor: ColorName.RGB | string;
    textColor?: ColorName.RGB | string;
}) => {
    const size = `${width}x${height}`;
    const toHex = (color: ColorName.RGB | string) =>
        (typeof color === 'string' ? color : Color.rgb(color).hex()).replaceAll('#', '');
    const bgHexColor = toHex(bgColor);
    const textHexColor = textColor == null ? '000000' : toHex(textColor);
    const textParam = text == null ? '' : `&text=${text}`;
    return `https://dummyimage.com/${size}/${bgHexColor}/${textHexColor}.png${textParam}`;
};

const generateDummyAvatarImage = (type: 1 | 2 | 3, size: 'small' | 'large') => {
    let bgColor: ColorName.RGB;
    let text: string;
    switch (type) {
        case 1:
            bgColor = ColorName.red;
            text = 'sample1';
            break;
        case 2:
            bgColor = ColorName.green;
            text = 'sample2';
            break;
        case 3:
            bgColor = ColorName.blue;
            text = 'sample3';
            break;
    }
    return generateDummyImage({
        text,
        width: size === 'small' ? 200 : 400,
        height: size === 'small' ? 200 : 600,
        bgColor,
    });
};

export type CreateMockRoomParams = {
    myParticipantRole: ParticipantRole;
    setBoards: boolean;
    setCharacters: boolean;
    setCharacterTagNames: boolean;
    setPublicChannelNames: boolean;
    setParamNames: boolean;
};

export const createMockRoom = (params: CreateMockRoomParams): State => {
    if (params.setBoards && !params.setCharacters) {
        throw new Error('setCharacters must be true when setBoards is true.');
    }

    const result: State = {
        $v: 2,
        $r: 1,
        activeBoardId: undefined,
        createdBy: '',
        name: '',
        boolParamNames: undefined,
        numParamNames: undefined,
        strParamNames: undefined,
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
        bgms: undefined,
        boards: undefined,
        characters: undefined,
        memos: undefined,
        participants: {
            [myUserUid]: {
                $v: 2,
                $r: 1,
                name: forceMaxLength100String(myParticipantName),
                role: params.myParticipantRole,
            },
            [anotherPlayerUserUid]: {
                $v: 2,
                $r: 1,
                name: forceMaxLength100String(anotherPlayerParticipantName),
                role: 'Player',
            },
            [anotherSpectatorUserUid]: {
                $v: 2,
                $r: 1,
                name: forceMaxLength100String(anotherSpectatorParticipantName),
                role: 'Spectator',
            },
        },
    };

    if (params.setBoards) {
        result.activeBoardId = defaultBoardId;
        result.boards = {
            [defaultBoardId]: {
                ...boardBase,
                backgroundImage: {
                    $v: 1,
                    $r: 1,
                    sourceType: 'Default',
                    path: generateDummyImage({
                        width: 300,
                        height: 300,
                        text: 'background',
                        bgColor: ColorName.gray,
                    }),
                },
                name: 'board-1-name',
                ownerParticipantId: myUserUid,
                dicePieces: {
                    [dicePieceKey1]: {
                        $v: 2,
                        $r: 1,
                        ownerCharacterId: myRichCharacterId,
                        dice: {
                            1: {
                                $v: 1,
                                $r: 1,
                                dieType: 'D6',
                                isValuePrivate: false,
                                value: 1,
                            },
                            2: {
                                $v: 1,
                                $r: 1,
                                dieType: 'D6',
                                isValuePrivate: false,
                                value: 2,
                            },
                        },
                        cellX: 0,
                        cellY: 0,
                        cellW: 1,
                        cellH: 1,
                        x: 10,
                        y: 10,
                        w: 40,
                        h: 30,
                        isCellMode: false,
                        isPositionLocked: false,
                        memo: 'dice-memo-1',
                        name: 'dice-name-1',
                        opacity: 0.7,
                    },
                    [dicePieceKey2]: {
                        $v: 2,
                        $r: 1,
                        ownerCharacterId: myRichCharacterId,
                        dice: {
                            1: {
                                $v: 1,
                                $r: 1,
                                dieType: 'D6',
                                isValuePrivate: false,
                                value: 3,
                            },
                            2: {
                                $v: 1,
                                $r: 1,
                                dieType: 'D6',
                                isValuePrivate: false,
                                value: 4,
                            },
                            3: {
                                $v: 1,
                                $r: 1,
                                dieType: 'D6',
                                isValuePrivate: false,
                                value: 5,
                            },
                            4: {
                                $v: 1,
                                $r: 1,
                                dieType: 'D6',
                                isValuePrivate: false,
                                value: undefined,
                            },
                        },
                        cellX: 1,
                        cellY: 0,
                        cellW: 1,
                        cellH: 2,
                        x: 10,
                        y: 10,
                        w: 10,
                        h: 10,
                        isCellMode: true,
                        isPositionLocked: false,
                        memo: 'dice-memo-2',
                        name: 'dice-name-2',
                        opacity: 0.7,
                    },
                },
                imagePieces: {
                    [imagePieceKey1]: {
                        $v: 2,
                        $r: 1,
                        ownerParticipantId: myUserUid,
                        cellX: 0,
                        cellY: 0,
                        cellH: 1,
                        cellW: 1,
                        x: 210,
                        y: 10,
                        w: 30,
                        h: 40,
                        isCellMode: false,
                        isPositionLocked: false,
                        memo: 'image-memo-1',
                        name: 'image-name-1',
                        image: {
                            $v: 1,
                            $r: 1,
                            sourceType: 'Default',
                            path: generateDummyImage({
                                width: 200,
                                height: 200,
                                text: 'image1',
                                bgColor: ColorName.cyan,
                            }),
                        },
                        isPrivate: false,
                        opacity: 0.7,
                    },
                    // ??????????????????????????????CellMode????????????????????????????????????????????????
                    [imagePieceKey2]: {
                        $v: 2,
                        $r: 1,
                        ownerParticipantId: myUserUid,
                        cellX: 5,
                        cellY: 0,
                        cellH: 2,
                        cellW: 1,
                        x: 10,
                        y: 10,
                        w: 10,
                        h: 10,
                        isCellMode: true,
                        isPositionLocked: false,
                        memo: 'image-memo-2',
                        name: 'image-name-2',
                        image: {
                            $v: 1,
                            $r: 1,
                            sourceType: 'Default',
                            path: generateDummyImage({
                                width: 200,
                                height: 200,
                                text: 'image2',
                                bgColor: ColorName.cyan,
                            }),
                        },
                        isPrivate: false,
                        opacity: 0.7,
                    },
                },
                stringPieces: {
                    [stringPieceKey1]: {
                        $v: 2,
                        $r: 1,
                        ownerCharacterId: myRichCharacterId,
                        cellX: 0,
                        cellY: 0,
                        cellH: 1,
                        cellW: 1,
                        x: 110,
                        y: 10,
                        w: 20,
                        h: 40,
                        isCellMode: false,
                        isPositionLocked: false,
                        memo: 'string-memo-1',
                        name: 'string-name-1',
                        value: '???????????????1',
                        valueInputType: 'String',
                        isValuePrivate: false,
                        opacity: 0.7,
                    },
                    [stringPieceKey2]: {
                        $v: 2,
                        $r: 1,
                        ownerCharacterId: myRichCharacterId,
                        cellX: 3,
                        cellY: 0,
                        cellW: 1,
                        cellH: 2,
                        x: 10,
                        y: 10,
                        w: 10,
                        h: 10,
                        isCellMode: true,
                        isPositionLocked: false,
                        memo: 'string-memo-2',
                        name: 'string-name-2',
                        value: '???????????????2',
                        valueInputType: 'String',
                        isValuePrivate: false,
                        opacity: 0.7,
                    },
                },
            },
        };
    }

    if (params.setCharacters) {
        result.characters = {
            [myRichCharacterId]: {
                ...characterBase,
                ownerParticipantId: myUserUid,
                name: 'character-1-name',
                memo: `????????????????????????????????????????????????
???????????????????????????????????????????????????
????????????????????????????????????????????????????????????????????????????????????????????????????????????
????????????????????????????????????????????????????????????
????????????????????????????????????????????????????????????????????????????????????????????????????????????
???????????????????????????????????????????????????????????????????????????????????????
??????????????????????????????????????????????????????????????????????????????????????????????????????
????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
????????????????????????????????????????????????????????????????????????
?????????????????????????????????????????????????????????????????????????????????????????????
???????????????????????????????????????????????????????????????????????????????????????????????????
???????????????????????????????????????????????????????????????
?????????????????????????????????????????????????????????????????????
??????????????????????????????????????????
?????????????????????????????????????????????????????????????????????????????????????????????`,
                image: {
                    $v: 1,
                    $r: 1,
                    path: generateDummyAvatarImage(1, 'small'),
                    sourceType: 'Default',
                },
                portraitImage: {
                    $v: 1,
                    $r: 1,
                    path: generateDummyAvatarImage(1, 'large'),
                    sourceType: 'Default',
                },
                chatPalette: `??????HP???{HP}??????
MP???{MP}??????
?????????
????????????
?????????
????????????
???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????`,
                privateVarToml: `HP=1
MP=2
SAN=30
Foo=4
Bar=5
Hoge=6
Fuga=7
Param8=8
Param9=9
Param10=10
Param11=11`,
                boolParams: {
                    1: {
                        $v: 2,
                        $r: 1,
                        isValuePrivate: false,
                        value: true,
                        overriddenParameterName: undefined,
                    },
                },
                numParams: {
                    1: {
                        $v: 2,
                        $r: 1,
                        isValuePrivate: false,
                        value: 5,
                        overriddenParameterName: undefined,
                    },
                    2: {
                        $v: 2,
                        $r: 1,
                        isValuePrivate: false,
                        value: 5,
                        overriddenParameterName: undefined,
                    },
                },
                numMaxParams: {
                    1: {
                        $v: 2,
                        $r: 1,
                        isValuePrivate: false,
                        value: 10,
                        overriddenParameterName: undefined,
                    },
                },
                strParams: {
                    1: {
                        $v: 2,
                        $r: 1,
                        isValuePrivate: false,
                        value: '????????????',
                        overriddenParameterName: undefined,
                    },
                },
                pieces: params.setBoards
                    ? {
                          [defaultBoardId]: {
                              $v: 2,
                              $r: 1,
                              boardId: defaultBoardId,
                              cellX: 0,
                              cellY: 0,
                              cellH: 1,
                              cellW: 1,
                              x: 10,
                              y: 110,
                              w: 40,
                              h: 40,
                              isCellMode: false,
                              isPositionLocked: false,
                              isPrivate: false,
                              memo: 'charapiece-memo-1',
                              name: 'charapiece-name-1',
                              opacity: 0.7,
                          },
                      }
                    : undefined,
                portraitPieces: params.setBoards
                    ? {
                          [defaultBoardId]: {
                              $v: 2,
                              $r: 1,
                              boardId: defaultBoardId,
                              x: 60,
                              y: 110,
                              w: 40,
                              h: 40,
                              isPositionLocked: false,
                              isPrivate: false,
                              memo: 'portrait-memo-1',
                              name: 'portrait-name-1',
                              opacity: 0.7,
                          },
                      }
                    : undefined,
            },
            [mySimpleCharacterId]: {
                ...characterBase,
                ownerParticipantId: myUserUid,
                name: 'character-2-name',
                memo: 'character-2-memo',
                image: {
                    $v: 1,
                    $r: 1,
                    path: generateDummyAvatarImage(2, 'small'),
                    sourceType: 'Default',
                },
                portraitImage: {
                    $v: 1,
                    $r: 1,
                    path: generateDummyAvatarImage(2, 'large'),
                    sourceType: 'Default',
                },
                hasTag1: true,
                chatPalette: 'character-2-chatpalette',
            },
            [anotherPlayerCharacterId1]: {
                ...characterBase,
                ownerParticipantId: anotherPlayerUserUid,
                name: 'character-3-name',
                memo: 'character-3-memo',
                image: {
                    $v: 1,
                    $r: 1,
                    path: generateDummyAvatarImage(3, 'small'),
                    sourceType: 'Default',
                },
                portraitImage: {
                    $v: 1,
                    $r: 1,
                    path: generateDummyAvatarImage(3, 'large'),
                    sourceType: 'Default',
                },
                chatPalette: 'character-3-chatpalette',
            },
        };
    }

    ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).forEach(i => {
        if (params.setCharacterTagNames) {
            result[`characterTag${i}Name`] = `characterTag${i}Name`;
        }

        if (params.setPublicChannelNames) {
            result[`publicChannel${i}Name`] = `publicChannel${i}Name`;
        }
    });

    ([1, 2] as const).forEach(i => {
        if (params.setParamNames) {
            if (result.numParamNames == null) {
                result.numParamNames = {};
            }
            result.numParamNames[i.toString()] = { $v: 1, $r: 1, name: `??????${i}` };
        }
    });

    if (params.setParamNames) {
        result.boolParamNames = { 1: { $v: 1, $r: 1, name: '?????????1' } };
        result.strParamNames = { 1: { $v: 1, $r: 1, name: '?????????1' } };
    }

    return result;
};

export type CreateMockRoomMessagesParams = {
    setGeneralMessages: boolean;
};

export const createMockRoomMessages = (params: CreateMockRoomMessagesParams): RoomMessages => {
    const createdAt = new Date(2020, 3, 12, 13, 14, 15).getTime();

    const m1: RoomPublicMessage = {
        __typename: 'RoomPublicMessage',
        messageId: '1',
        channelKey: $free,
        isSecret: false,
        createdAt,
        createdBy: anotherPlayerUserUid,
        initText: 'text',
        initTextSource: 'text',
    };

    const m2: RoomPublicMessage = {
        __typename: 'RoomPublicMessage',
        messageId: '2',
        channelKey: '1',
        isSecret: false,
        createdAt,
        createdBy: myUserUid,
        initText: 'text',
        initTextSource: 'text',
    };

    const m3: RoomPublicMessage = {
        __typename: 'RoomPublicMessage',
        messageId: '3',
        channelKey: '2',
        isSecret: false,
        createdAt,
        createdBy: anotherPlayerUserUid,
        initText: 'text',
        initTextSource: 'text',
    };

    const m4: RoomPrivateMessage = {
        __typename: 'RoomPrivateMessage',
        messageId: '4',
        isSecret: false,
        createdAt,
        createdBy: myUserUid,
        initText: 'text',
        initTextSource: 'text',
        visibleTo: [myUserUid],
    };

    const m5: RoomPrivateMessage = {
        __typename: 'RoomPrivateMessage',
        messageId: '5',
        isSecret: false,
        createdAt,
        createdBy: anotherPlayerUserUid,
        initText: 'text',
        initTextSource: 'text',
        visibleTo: [myUserUid, anotherPlayerUserUid],
    };

    const result: RoomMessages = {
        publicMessages: [],
        privateMessages: [],
        publicChannels: [],
        pieceLogs: [],
        soundEffects: [],
    };

    if (params.setGeneralMessages) {
        result.publicMessages = [m1, m2, m3];
        result.privateMessages = [m4, m5];
    }

    return result;
};

export const mockUser: User = {
    emailVerified: false,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: function (): Promise<void> {
        throw new Error('Function not implemented.');
    },
    getIdToken: function (): Promise<string> {
        return Promise.resolve(myUserUid);
    },
    getIdTokenResult: function (): Promise<IdTokenResult> {
        // TODO: antd???moment?????????????????????????????????dayjs???????????????????????????
        const authTime = moment().subtract(1, 'day');
        const expirationTime = moment().add(1, 'day');
        const issuedAtTime = moment();

        return Promise.resolve({
            token: myUserUid,
            authTime: authTime.toISOString(),
            expirationTime: expirationTime.toISOString(),
            issuedAtTime: issuedAtTime.toISOString(),
            signInProvider: null,
            signInSecondFactor: null,
            claims: {},
        });
    },
    reload: function (): Promise<void> {
        throw new Error('Function not implemented.');
    },
    toJSON: function (): object {
        throw new Error('Function not implemented.');
    },
    displayName: myDisplayName,
    email: null,
    phoneNumber: null,
    photoURL: null,
    providerId: '',
    uid: myUserUid,
};
