import { atom, Atom } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import React from 'react';
import { useLatest } from 'react-use';

export const useAtomSelector = <T1, T2>(anAtom: Atom<T1>, mapping: (value: T1) => T2) => {
    const mappingRef = useLatest(mapping);
    const mappedAtom = React.useMemo(() => {
        return atom(get => mappingRef.current(get(anAtom)));
    }, [anAtom, mappingRef]);
    const result = useAtomValue(mappedAtom);
    return result;
};
