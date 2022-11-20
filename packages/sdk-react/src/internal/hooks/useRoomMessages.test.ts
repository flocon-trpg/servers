import { createTestRoomClient } from '@flocon-trpg/sdk';
import {
    GetRoomMessagesFailureType,
    RoomPublicMessage,
} from '@flocon-trpg/typed-document-node-v0.7.1';
import { Message } from '@flocon-trpg/web-server-utils';
import { act, renderHook } from '@testing-library/react';
import { useRoomMessages } from './useRoomMessages';

describe('useRoomMessages', () => {
    it('tests queryStatus', () => {
        const testRoomClient = createTestRoomClient({});

        const { result } = renderHook(props => useRoomMessages(props), {
            initialProps: { messages: testRoomClient.roomClient.messages },
        });

        act(() => {
            testRoomClient.source.queryStatus.next({ type: 'success' });
        });
        expect(result.current.queryStatus.type).toBe('success');

        act(() => {
            testRoomClient.source.queryStatus.next({
                type: 'error',
                error: {
                    type: 'GetRoomMessagesFailureResult',
                    failureType: GetRoomMessagesFailureType.RoomNotFound,
                },
            });
        });
        expect(result.current.queryStatus).toEqual({
            type: 'error',
            error: {
                type: 'GetRoomMessagesFailureResult',
                failureType: GetRoomMessagesFailureType.RoomNotFound,
            },
        });
    });

    it('tests init messages', () => {
        const testRoomClient = createTestRoomClient({});
        const { result } = renderHook(props => useRoomMessages(props), {
            initialProps: { messages: testRoomClient.roomClient.messages },
        });
        expect(result.current.messages.diff).toBeUndefined();
        expect(result.current.messages.current).toEqual([]);
    });

    it('tests query with no filter', () => {
        const createdAt = new Date().getTime();

        const message1: RoomPublicMessage = {
            __typename: 'RoomPublicMessage',
            channelKey: '1',
            createdAt,
            isSecret: false,
            messageId: 'message-id1',
            initText: 'text',
        };

        const testRoomClient = createTestRoomClient({});

        const { result } = renderHook(props => useRoomMessages(props), {
            initialProps: { messages: testRoomClient.roomClient.messages },
        });

        act(() => {
            testRoomClient.source.roomMessageClient.onQuery({
                publicMessages: [message1],
                publicChannels: [],
                privateMessages: [],
                pieceLogs: [],
                soundEffects: [],
            });
        });
        const expectedMessage: Message<null> = {
            type: 'publicMessage',
            value: message1,
        };
        expect(result.current.messages.diff).toBeUndefined();
        expect(result.current.messages.current).toEqual([expectedMessage]);
    });

    it('tests event with no filter', () => {
        const createdAt = new Date().getTime();

        const message1: RoomPublicMessage = {
            __typename: 'RoomPublicMessage',
            channelKey: '1',
            createdAt,
            isSecret: false,
            messageId: 'message-id1',
            initText: 'text1',
        };
        const message2: RoomPublicMessage = {
            __typename: 'RoomPublicMessage',
            channelKey: '1',
            createdAt,
            isSecret: false,
            messageId: 'message-id2',
            initText: 'text1',
        };

        const testRoomClient = createTestRoomClient({});

        const { result } = renderHook(props => useRoomMessages(props), {
            initialProps: { messages: testRoomClient.roomClient.messages },
        });
        act(() => {
            testRoomClient.source.roomMessageClient.onQuery({
                publicMessages: [message1],
                publicChannels: [],
                privateMessages: [],
                pieceLogs: [],
                soundEffects: [],
            });
            testRoomClient.source.roomMessageClient.onEvent({
                ...message2,
                __typename: 'RoomPublicMessage',
            });
        });

        const expectedMessage1: Message<null> = {
            type: 'publicMessage',
            value: message1,
        };
        const expectedMessage2: Message<null> = {
            type: 'publicMessage',
            value: message2,
        };
        expect(result.current.messages.diff).toEqual({ nextValue: expectedMessage2 });
        expect(result.current.messages.current).toEqual([expectedMessage1, expectedMessage2]);
    });

    it('tests query with filter', () => {
        const createdAt = new Date().getTime();

        const message1: RoomPublicMessage = {
            __typename: 'RoomPublicMessage',
            channelKey: '1',
            createdAt,
            isSecret: false,
            messageId: 'message-id1',
            initText: 'text1',
        };
        const message2: RoomPublicMessage = {
            __typename: 'RoomPublicMessage',
            channelKey: '1',
            createdAt,
            isSecret: false,
            messageId: 'message-id2',
            initText: 'text2',
        };

        const testRoomClient = createTestRoomClient({});

        const filter = (message: Message<unknown>) =>
            message.type === 'publicMessage' ? message.value.initText === 'text1' : true;
        const { result } = renderHook(props => useRoomMessages(props.arg1, props.arg2), {
            initialProps: { arg1: testRoomClient.roomClient, arg2: filter },
        });
        expect(result.current.messages.diff).toBeUndefined();
        expect(result.current.messages.current).toEqual([]);

        act(() => {
            testRoomClient.source.roomMessageClient.onQuery({
                publicMessages: [message1, message2],
                publicChannels: [],
                privateMessages: [],
                pieceLogs: [],
                soundEffects: [],
            });
        });
        const expectedMessage: Message<unknown> = {
            type: 'publicMessage',
            value: message1,
        };
        expect(result.current.messages.diff).toBeUndefined();
        expect(result.current.messages.current).toEqual([expectedMessage]);
    });

    it('tests event with filter', () => {
        const createdAt = new Date().getTime();

        const message: RoomPublicMessage = {
            __typename: 'RoomPublicMessage',
            channelKey: '1',
            createdAt,
            isSecret: false,
            messageId: 'message-id1',
            initText: 'text1',
        };

        const testRoomClient = createTestRoomClient({});

        const filter = (message: Message<unknown>) =>
            message.type === 'publicMessage' ? message.value.initText === 'text1' : true;
        const { result } = renderHook(props => useRoomMessages(props.arg1, props.arg2), {
            initialProps: { arg1: testRoomClient.roomClient, arg2: filter },
        });
        act(() => {
            testRoomClient.source.roomMessageClient.onQuery({
                publicMessages: [],
                publicChannels: [],
                privateMessages: [],
                pieceLogs: [],
                soundEffects: [],
            });
            testRoomClient.source.roomMessageClient.onEvent({
                ...message,
                __typename: 'RoomPublicMessage',
            });
        });

        const expectedMessage: Message<null> = {
            type: 'publicMessage',
            value: message,
        };
        expect(result.current.messages.diff).toEqual({ nextValue: expectedMessage });
        expect(result.current.messages.current).toEqual([expectedMessage]);
    });

    it('tests event with filter', () => {
        const createdAt = new Date().getTime();

        const message: RoomPublicMessage = {
            __typename: 'RoomPublicMessage',
            channelKey: '1',
            createdAt,
            isSecret: false,
            messageId: 'message-id1',
            initText: 'text1',
        };

        const testRoomClient = createTestRoomClient({});

        const filter = () => false;
        const { result } = renderHook(props => useRoomMessages(props.arg1, props.arg2), {
            initialProps: { arg1: testRoomClient.roomClient, arg2: filter },
        });
        act(() => {
            testRoomClient.source.roomMessageClient.onQuery({
                publicMessages: [],
                publicChannels: [],
                privateMessages: [],
                pieceLogs: [],
                soundEffects: [],
            });
            testRoomClient.source.roomMessageClient.onEvent({
                ...message,
                __typename: 'RoomPublicMessage',
            });
        });

        expect(result.current.messages.diff).toBeUndefined();
        expect(result.current.messages.current).toEqual([]);
    });
});
