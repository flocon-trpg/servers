import { createStateMap, ReadonlyStateMap, recordForEach, StateMap } from '@kizahasi/util';
import React from 'react';
import { useLatest } from 'react-use';

const equals = <T>(x: StateMap<T>, y: StateMap<T>) => {
    if (x.size !== y.size) {
        return false;
    }
    let hasDifferentValue = false;
    x.forEach((xValue, key) => {
        if (hasDifferentValue) {
            return;
        }
        const yValue = y.get(key);
        if (xValue !== yValue) {
            hasDifferentValue = true;
            return;
        }
    });
    return !hasDifferentValue;
};

export const useCreateStateMap = <TSource, TValue>(
    source: Record<string, TSource | undefined>,
    convert: (source: TSource) => Record<string, TValue | undefined> | null | undefined
): ReadonlyStateMap<TValue> | undefined => {
    const convertRef = useLatest(convert);
    const [result, setResult] = React.useState<StateMap<TValue>>();
    const resultRef = useLatest(result);

    React.useEffect(() => {
        const newStateMap = createStateMap<TValue>();
        recordForEach(source, (recordValue, key1) => {
            const inner = convertRef.current(recordValue);
            if (inner == null) {
                return;
            }
            recordForEach(inner, (value, key2) => {
                newStateMap.set({ createdBy: key1, id: key2 }, value);
            });
        });
        if (resultRef.current != null && equals(resultRef.current, newStateMap)) {
            return;
        }
        setResult(newStateMap);
    }, [convertRef, resultRef, source]);

    return result;
};
