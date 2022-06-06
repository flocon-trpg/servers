import { Auth, Config, IdTokenResult, Unsubscribe, User } from 'firebase/auth';
import { $free, ParticipantRole, forceMaxLength100String } from '@flocon-trpg/core';
import {
    RoomMessages,
    RoomPrivateMessage,
    RoomPublicMessage,
} from '@flocon-trpg/typed-document-node-v0.7.1';
import { State as S, characterTemplate, roomTemplate } from '@flocon-trpg/core';
import { WebConfig } from '../configType';
import { UserConfig, defaultUserConfig } from '../atoms/userConfig/types';
import { FirebaseStorage } from '@firebase/storage';
import { FirebaseApp } from '@firebase/app';
import { Client, createClient } from '@urql/core';

type State = S<typeof roomTemplate>;
type CharacterState = S<typeof characterTemplate>;

const myUserUid = 'my-user-uid';
const myParticipantName = 'my-participant-name';
const anotherPlayerUserUid = 'player-user-uid';
const anotherPlayerParticipantName = 'player-participant-name1';
const anotherSpectatorUserUid = 'spectator-user-uid';
const anotherSpectatorParticipantName = 'spectator-participant-name2';
const myDisplayName = 'my-display-name';

export const myRichCharacterId = 'character-id-1';
export const mySimpleCharacterId = 'character-id-2';
export const anotherPlayerCharacterId1 = 'character-id-3';

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
};

export const mockStorage: FirebaseStorage = {
    app: appData,
    maxUploadRetryTime: 1000,
    maxOperationRetryTime: 1000,
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
    // https://formidable.com/open-source/urql/docs/advanced/testing/ では executeQuery と executeMutation と executeSubscription のみからなるオブジェクトを作る例を紹介しているが、query メソッドなども利用することがあるので Client インスタンスを作ってからメソッドを差し替える方法をとっている。

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

// https://dummyimage.com/ というダミー画像生成サイトを利用している
const generateDummyImage = (type: 1 | 2 | 3, size: 'small' | 'large') => {
    const sizeParam = size === 'small' ? '200x200' : '400x600';
    switch (type) {
        case 1:
            return `https://dummyimage.com/${sizeParam}/fffebd/000000.png&text=sample1`;
        case 2:
            return `https://dummyimage.com/${sizeParam}/bffffe/000000.png&text=sample2`;
        case 3:
            return `https://dummyimage.com/${sizeParam}/efbfff/000000.png&text=sample3`;
    }
};

export type CreateMockRoomParams = {
    myParticipantRole: ParticipantRole;
    setCharacters: boolean;
    setCharacterTagNames: boolean;
    setPublicChannelNames: boolean;
    setParamNames: boolean;
};

export const createMockRoom = (params: CreateMockRoomParams): State => {
    const result: State = {
        $v: 2,
        $r: 1,
        activeBoardId: '',
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

    if (params.setCharacters) {
        result.characters = {
            [myRichCharacterId]: {
                ...characterBase,
                ownerParticipantId: myUserUid,
                name: 'character-1-name',
                memo: `吾輩は猫である。名前はまだ無い。
どこで生れたかとんと見当がつかぬ。
何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。
吾輩はここで始めて人間というものを見た。
しかもあとで聞くとそれは書生という人間中で一番獰悪な種族であったそうだ。
この書生というのは時々我々を捕えて煮て食うという話である。
しかしその当時は何という考もなかったから別段恐しいとも思わなかった。
ただ彼の掌に載せられてスーと持ち上げられた時何だかフワフワした感じがあったばかりである。
掌の上で少し落ちついて書生の顔を見たのがいわゆる人間というものの見始であろう。
この時妙なものだと思った感じが今でも残っている。
第一毛をもって装飾されべきはずの顔がつるつるしてまるで薬缶だ。
その後猫にもだいぶ逢ったがこんな片輪には一度も出会わした事がない。
のみならず顔の真中があまりに突起している。
そうしてその穴の中から時々ぷうぷうと煙を吹く。
どうも咽せぽくて実に弱った。
これが人間の飲む煙草というものである事はようやくこの頃知った。`,
                image: {
                    $v: 1,
                    $r: 1,
                    path: generateDummyImage(1, 'small'),
                    sourceType: 'Default',
                },
                portraitImage: {
                    $v: 1,
                    $r: 1,
                    path: generateDummyImage(1, 'large'),
                    sourceType: 'Default',
                },
                chatPalette: `私のHPは{HP}です
MPは{MP}です
あああ
いいいい
ううう
ええええ
あのイーハトーヴォのすきとおった風、夏でも底に冷たさをもつ青いそら、うつくしい森で飾られたモリーオ市、郊外のぎらぎらひかる草の波。
またそのなかでいっしょになったたくさんのひとたち、ファゼーロとロザーロ、羊飼のミーロや、顔の赤いこどもたち、地主のテーモ、山猫博士のボーガント・デストゥパーゴなど、いまこの暗い巨きな石の建物のなかで考えていると、みんなむかし風のなつかしい青い幻燈のように思われます。では、わたくしはいつかの小さなみだしをつけながら、しずかにあの年のイーハトーヴォの五月から十月までを書きつけましょう。`,
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
                        value: 'サンプル',
                        overriddenParameterName: undefined,
                    },
                },
            },
            [mySimpleCharacterId]: {
                ...characterBase,
                ownerParticipantId: myUserUid,
                name: 'character-2-name',
                memo: 'character-2-memo',
                image: {
                    $v: 1,
                    $r: 1,
                    path: generateDummyImage(2, 'small'),
                    sourceType: 'Default',
                },
                portraitImage: {
                    $v: 1,
                    $r: 1,
                    path: generateDummyImage(2, 'large'),
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
                    path: generateDummyImage(3, 'small'),
                    sourceType: 'Default',
                },
                portraitImage: {
                    $v: 1,
                    $r: 1,
                    path: generateDummyImage(3, 'large'),
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
            result.numParamNames[i.toString()] = { $v: 1, $r: 1, name: `数値${i}` };
        }
    });

    if (params.setParamNames) {
        result.boolParamNames = { 1: { $v: 1, $r: 1, name: '真偽値1' } };
        result.strParamNames = { 1: { $v: 1, $r: 1, name: '文字列1' } };
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
        throw new Error('Function not implemented.');
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
