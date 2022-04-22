import { FileSourceType, PieceLogType, RoomMessages } from '@flocon-trpg/typed-document-node';
import { Message, privateMessage, publicMessage, pieceLog } from '../src';
import { soundEffect } from '../src/internal/roomMessages';

export namespace Resources {
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

    export namespace RoomPublicMessage {
        export const message1 = {
            __typename: 'RoomPublicMessage' as const,
            messageId: 'messageid1',
            channelKey: '1',
            isSecret: false,
            createdAt: 1_500_000_001,
            initText: 'text1',
            initTextSource: 'textsource1',
        };

        export const message3 = {
            __typename: 'RoomPublicMessage' as const,
            messageId: 'messageid3',
            channelKey: '1',
            isSecret: false,
            createdAt: 1_500_000_003,
            initText: 'text3',
            initTextSource: 'textsource3',
        };

        export const updatedMessage3 = {
            ...message3,
            initText: 'text3_2',
            updatedAt: message3.createdAt + 10,
        };

        export const updateMessage3Event = {
            ...updatedMessage3,
            __typename: 'RoomPublicMessageUpdate' as const,
        };

        export const message7 = {
            __typename: 'RoomPublicMessage' as const,
            messageId: 'messageid7',
            channelKey: '1',
            isSecret: false,
            createdAt: 1_500_000_007,
            initText: 'text7',
            initTextSource: 'textsource7',
        };
    }

    export namespace RoomPrivateMessage {
        export const message2 = {
            __typename: 'RoomPrivateMessage' as const,
            messageId: 'messageid2',
            isSecret: false,
            createdAt: 1_500_000_002,
            initText: 'text2',
            initTextSource: 'textsource2',
            visibleTo: ['userId1', 'userId2'],
        };

        export const message4 = {
            __typename: 'RoomPrivateMessage' as const,
            messageId: 'messageid4',
            isSecret: false,
            createdAt: 1_500_000_004,
            initText: 'text4',
            initTextSource: 'textsource4',
            visibleTo: ['userId1', 'userId3'],
        };

        export const updatedMessage4 = {
            ...message4,
            initText: 'text4_2',
            updatedAt: message4.createdAt + 10,
        };

        export const updateMessage4Event = {
            ...updatedMessage4,
            __typename: 'RoomPrivateMessageUpdate' as const,
        };

        export const message8 = {
            __typename: 'RoomPrivateMessage' as const,
            messageId: 'messageid8',
            isSecret: false,
            createdAt: 1_500_000_008,
            initText: 'text8',
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
        export const publicMessage1: Message = {
            type: publicMessage,
            value: RoomPublicMessage.message1,
        };

        export const privateMessage2: Message = {
            type: privateMessage,
            value: RoomPrivateMessage.message2,
        };

        export const publicMessage3: Message = {
            type: publicMessage,
            value: RoomPublicMessage.message3,
        };

        export const updatedPublicMessage3: Message = {
            type: publicMessage,
            value: RoomPublicMessage.updatedMessage3,
        };

        export const privateMessage4: Message = {
            type: privateMessage,
            value: RoomPrivateMessage.message4,
        };

        export const updatedPrivateMessage4: Message = {
            type: privateMessage,
            value: RoomPrivateMessage.updatedMessage4,
        };

        export const soundEffect5: Message = {
            type: soundEffect,
            value: SoundEffect.message5,
        };

        export const pieceLog6: Message = {
            type: pieceLog,
            value: PieceLog.message6,
        };

        export const publicMessage7: Message = {
            type: publicMessage,
            value: RoomPublicMessage.message7,
        };

        export const privateMessage8: Message = {
            type: privateMessage,
            value: RoomPrivateMessage.message8,
        };
    }
}
