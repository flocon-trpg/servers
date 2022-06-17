import { renderHook } from '@testing-library/react';
import { usePersistentMemo } from './usePersistentMemo';

it('tests usePersistentMemo', () => {
    const { result, rerender } = renderHook(
        // eslint-disable-next-line react-hooks/exhaustive-deps
        props => usePersistentMemo(props.factory, props.deps),
        {
            initialProps: { factory: () => 'result1', deps: [1] },
        }
    );
    expect(result.current).toBe('result1');
    rerender({ factory: () => 'result2', deps: [1] });
    expect(result.current).toBe('result1');
    rerender({ factory: () => 'result3', deps: [2] });
    expect(result.current).toBe('result3');
});
