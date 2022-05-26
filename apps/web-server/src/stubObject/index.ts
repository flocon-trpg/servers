import { Auth, Config, IdTokenResult, Unsubscribe, User } from 'firebase/auth';
import { $free, ParticipantRole, forceMaxLength100String } from '@flocon-trpg/core';
import {
    RoomMessages,
    RoomPrivateMessage,
    RoomPublicMessage,
} from '@flocon-trpg/typed-document-node-v0.7.1';
import { State as S, roomTemplate } from '@flocon-trpg/core';
import { WebConfig } from '../configType';
import { UserConfig, defaultUserConfig } from '../atoms/userConfig/types';

type State = S<typeof roomTemplate>;

const myUserUid = 'my-user-uid';
const userUid1 = 'user-uid-1';
const myParticipantName = 'participant-name';
const displayName = 'display-name';

export const firebaseConfigData: Config = {
    apiKey: '',
    authDomain: '',
    apiHost: '',
    apiScheme: '',
    tokenApiHost: '',
    sdkClientVersion: '',
};

export const webConfigData: WebConfig = {
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

export const userConfigData: UserConfig = defaultUserConfig(myUserUid);

export const authData: Auth = {
    app: { name: '', options: {}, automaticDataCollectionEnabled: false },
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

export type GenerateRoomDataParams = {
    myParticipantRole: ParticipantRole;
    setCharacterTagNames: boolean;
    setPublicChannelNames: boolean;
};

export const generateRoomData = (params: GenerateRoomDataParams): State => {
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
        },
    };

    ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).forEach(i => {
        if (params.setCharacterTagNames) {
            result[`characterTag${i}Name`] = `characterTag${i}Name`;
        }
        if (params.setPublicChannelNames) {
            result[`publicChannel${i}Name`] = `publicChannel${i}Name`;
        }
    });

    return result;
};

export type GenerateRoomMessagesDataParams = {
    setGeneralMessages: boolean;
};

export const generateRoomMessagesData = (params: GenerateRoomMessagesDataParams): RoomMessages => {
    const m1: RoomPublicMessage = {
        __typename: 'RoomPublicMessage',
        messageId: '1',
        channelKey: $free,
        isSecret: false,
        createdAt: new Date().getTime(),
        createdBy: userUid1,
        initText: 'text',
        initTextSource: 'text',
    };

    const m2: RoomPublicMessage = {
        __typename: 'RoomPublicMessage',
        messageId: '2',
        channelKey: '1',
        isSecret: false,
        createdAt: new Date().getTime(),
        createdBy: myUserUid,
        initText: 'text',
        initTextSource: 'text',
    };

    const m3: RoomPublicMessage = {
        __typename: 'RoomPublicMessage',
        messageId: '3',
        channelKey: '2',
        isSecret: false,
        createdAt: new Date().getTime(),
        createdBy: userUid1,
        initText: 'text',
        initTextSource: 'text',
    };

    const m4: RoomPrivateMessage = {
        __typename: 'RoomPrivateMessage',
        messageId: '4',
        isSecret: false,
        createdAt: new Date().getTime(),
        createdBy: myUserUid,
        initText: 'text',
        initTextSource: 'text',
        visibleTo: [myUserUid],
    };

    const m5: RoomPrivateMessage = {
        __typename: 'RoomPrivateMessage',
        messageId: '5',
        isSecret: false,
        createdAt: new Date().getTime(),
        createdBy: userUid1,
        initText: 'text',
        initTextSource: 'text',
        visibleTo: [myUserUid, userUid1],
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

export const userData: User = {
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
        throw new Error('Function not implemented.');
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
    displayName,
    email: null,
    phoneNumber: null,
    photoURL: null,
    providerId: '',
    uid: myUserUid,
};
