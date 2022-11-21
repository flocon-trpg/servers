import { ReadonlyBehaviorEvent } from '@flocon-trpg/sdk';
import { useEffect, useState } from 'react';

export const useReadonlyBehaviorStream = <T>(source: ReadonlyBehaviorEvent<T> | T): T => {
    const [state, setState] = useState(() => {
        if (source instanceof ReadonlyBehaviorEvent) {
            return source.getValue();
        }
        return source;
    });
    useEffect(() => {
        if (source instanceof ReadonlyBehaviorEvent) {
            setState(source.getValue());
            const subscription = source.subscribe({ next: value => setState(value) });
            return () => subscription.unsubscribe();
        }
        setState(source);
        return undefined;
    }, [source]);
    return state;
};
