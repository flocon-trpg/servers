import { Atom } from 'jotai';
import { selectAtom, useAtomValue } from 'jotai/utils';

export const useAtomSelector = <T1, T2>(anAtom: Atom<T1>, mapping: (value: T1) => T2) => {
    const mappedAtom = selectAtom(anAtom, mapping);
    return useAtomValue(mappedAtom);
};
