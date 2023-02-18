import { createTestRoomClient } from '@flocon-trpg/sdk';
import { GetRoomMessagesFailureType } from '@flocon-trpg/typed-document-node-v0.7.13';
import { act, renderHook } from '@testing-library/react';
import { useRoomMessageQueryStatus } from './useRoomMessageQueryStatus';

describe('useRoomMessageQueryStatus', () => {
    it('tests queryStatus', () => {
        const testRoomClient = createTestRoomClient({});

        const { result } = renderHook(props => useRoomMessageQueryStatus(props), {
            initialProps: { messages: testRoomClient.roomClient.messages },
        });

        act(() => {
            testRoomClient.source.queryStatus.next({ type: 'success' });
        });
        expect(result.current.type).toBe('success');

        act(() => {
            testRoomClient.source.queryStatus.next({
                type: 'error',
                error: {
                    type: 'GetRoomMessagesFailureResult',
                    failureType: GetRoomMessagesFailureType.RoomNotFound,
                },
            });
        });
        expect(result.current).toEqual({
            type: 'error',
            error: {
                type: 'GetRoomMessagesFailureResult',
                failureType: GetRoomMessagesFailureType.RoomNotFound,
            },
        });
    });
});
