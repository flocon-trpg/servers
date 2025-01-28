import { FileSourceType, GetMessagesDoc, PieceLogType } from '@flocon-trpg/graphql-documents';
import { ResultOf } from '@graphql-typed-document-node/core';
import { Message, pieceLog, privateMessage, publicMessage, soundEffect } from '../src';

type GetRoomMessagesQueryResult = ResultOf<typeof GetMessagesDoc>['result'];
type RoomMessages = Extract<GetRoomMessagesQueryResult, { __typename?: 'RoomMessages' }>;

export type TestCustomMessage = string;

export namespace Fixtures {
    export namespace RoomMessages {
        export const empty: RoomMessages = {
            __typename: 'RoomMessages',
            pieceLogs: [],
            privateMessages: [],
            publicChannels: [],
            publicMessages: [],
            soundEffects: [],
        };
    }

    /*
    message1aの1の番号が若いほどcreatedAtが小さい（ただしupdatedMessageは例外）。aの部分はaかbのいずれかであり、filterのテストに用いる。
    */
    export namespace RoomPublicMessage {
        export const message1a = {
            __typename: 'RoomPublicMessage' as const,
            messageId: 'messageid1',
            channelKey: '1',
            isSecret: false,
            createdAt: 1_500_000_001,
            initText: 'a:text1',
            initTextSource: 'textsource1',
        };

        export const message3a = {
            __typename: 'RoomPublicMessage' as const,
            messageId: 'messageid3',
            channelKey: '1',
            isSecret: false,
            createdAt: 1_500_000_003,
            initText: 'a:text3',
            initTextSource: 'textsource3',
        };

        export const updatedMessage3b = {
            ...message3a,
            updatedAt: message3a.createdAt + 10,
            updatedText: {
                currentText: 'b:text3_2',
                updatedAt: message3a.createdAt + 10,
            },
        };

        export const updateMessage3aTo3bEvent = {
            ...updatedMessage3b,
            __typename: 'RoomPublicMessageUpdate' as const,
        };

        export const message7b = {
            __typename: 'RoomPublicMessage' as const,
            messageId: 'messageid7',
            channelKey: '1',
            isSecret: false,
            createdAt: 1_500_000_007,
            initText: 'b:text7',
            initTextSource: 'textsource7',
        };
    }

    export namespace RoomPrivateMessage {
        export const message2a = {
            __typename: 'RoomPrivateMessage' as const,
            messageId: 'messageid2',
            isSecret: false,
            createdAt: 1_500_000_002,
            initText: 'a:text2',
            initTextSource: 'textsource2',
            visibleTo: ['userId1', 'userId2'],
        };

        export const message4a = {
            __typename: 'RoomPrivateMessage' as const,
            messageId: 'messageid4',
            isSecret: false,
            createdAt: 1_500_000_004,
            initText: 'a:text4',
            initTextSource: 'textsource4',
            visibleTo: ['userId1', 'userId3'],
        };

        export const updatedMessage4b = {
            ...message4a,
            updatedAt: message4a.createdAt + 10,
            updatedText: {
                currentText: 'b:text4_2',
                updatedAt: message4a.createdAt + 10,
            },
        };

        export const updateMessage4aTo4bEvent = {
            ...updatedMessage4b,
            __typename: 'RoomPrivateMessageUpdate' as const,
        };

        export const message8b = {
            __typename: 'RoomPrivateMessage' as const,
            messageId: 'messageid8',
            isSecret: false,
            createdAt: 1_500_000_008,
            initText: 'b:text8',
            initTextSource: 'textsource8',
            visibleTo: ['userId1', 'userId2', 'userId3'],
        };
    }

    export namespace RoomPublicChannel {
        export const channel1 = {
            __typename: 'RoomPublicChannel' as const,
            key: '1',
            name: 'channel1',
        };
        export const channel2 = {
            __typename: 'RoomPublicChannel' as const,
            key: '2',
            name: 'channel2',
        };
    }

    export namespace RoomPublicChannelUpdate {
        export const channel1 = {
            __typename: 'RoomPublicChannelUpdate' as const,
            key: '1',
            name: 'channel1',
        };
        export const channel2 = {
            __typename: 'RoomPublicChannelUpdate' as const,
            key: '2',
            name: 'channel2',
        };
    }

    export namespace SoundEffect {
        export const message5 = {
            __typename: 'RoomSoundEffect' as const,
            messageId: 'messageid5',
            createdAt: 1_500_000_005,
            volume: 1,
            file: {
                __typename: 'FilePath' as const,
                path: '',
                sourceType: FileSourceType.Default,
            },
        };
    }

    export namespace PieceLog {
        export const message6 = {
            __typename: 'PieceLog' as const,
            messageId: 'messageid6',
            createdAt: 1_500_000_006,
            stateId: 'stateid',
            logType: PieceLogType.Dice,
            valueJson: '{}',
        };
    }

    export namespace Message {
        export const publicMessage1a: Message<TestCustomMessage> = {
            type: publicMessage,
            value: RoomPublicMessage.message1a,
        };

        export const privateMessage2a: Message<TestCustomMessage> = {
            type: privateMessage,
            value: RoomPrivateMessage.message2a,
        };

        export const publicMessage3a: Message<TestCustomMessage> = {
            type: publicMessage,
            value: RoomPublicMessage.message3a,
        };

        export const updatedPublicMessage3b: Message<TestCustomMessage> = {
            type: publicMessage,
            value: RoomPublicMessage.updatedMessage3b,
        };

        export const privateMessage4a: Message<TestCustomMessage> = {
            type: privateMessage,
            value: RoomPrivateMessage.message4a,
        };

        export const updatedPrivateMessage4b: Message<TestCustomMessage> = {
            type: privateMessage,
            value: RoomPrivateMessage.updatedMessage4b,
        };

        export const soundEffect5: Message<TestCustomMessage> = {
            type: soundEffect,
            value: SoundEffect.message5,
        };

        export const pieceLog6: Message<TestCustomMessage> = {
            type: pieceLog,
            value: PieceLog.message6,
        };

        export const publicMessage7b: Message<TestCustomMessage> = {
            type: publicMessage,
            value: RoomPublicMessage.message7b,
        };

        export const privateMessage8b: Message<TestCustomMessage> = {
            type: privateMessage,
            value: RoomPrivateMessage.message8b,
        };
    }
}
