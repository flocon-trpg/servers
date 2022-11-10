import { BehaviorEvent, ReadonlyBehaviorEvent } from '@flocon-trpg/sdk';
import { act, renderHook } from '@testing-library/react';
import { useReadonlyBehaviorStream } from './useReadonlyBehaviorEvent';

describe('useReadonlyBehaviorStream', () => {
    it('tests non-stream -> non-stream', () => {
        const actual = renderHook(initialProps => useReadonlyBehaviorStream(initialProps), {
            initialProps: 1,
        });
        expect(actual.result.current).toBe(1);
        actual.rerender(2);
        expect(actual.result.current).toBe(2);
    });

    it('tests stream -> stream', () => {
        const streamSource1 = new BehaviorEvent(1);
        const stream1 = new ReadonlyBehaviorEvent(streamSource1);
        const actual = renderHook(initialProps => useReadonlyBehaviorStream(initialProps), {
            initialProps: stream1,
        });
        expect(actual.result.current).toBe(1);
        act(() => {
            streamSource1.next(2);
        });
        expect(actual.result.current).toBe(2);

        const streamSource2 = new BehaviorEvent(3);
        const stream2 = new ReadonlyBehaviorEvent(streamSource2);
        actual.rerender(stream2);
        expect(actual.result.current).toBe(3);
        act(() => {
            streamSource1.next(-1);
        });
        expect(actual.result.current).toBe(3);
        act(() => {
            streamSource2.next(4);
        });
        expect(actual.result.current).toBe(4);
    });
});
