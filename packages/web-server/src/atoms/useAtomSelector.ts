import { Atom, useAtom } from 'jotai';
import { selectAtom } from 'jotai/utils';

export const useAtomSelector = <T1, T2>(anAtom: Atom<T1>, mapping: (value: T1) => T2) => {
    const mappedAtom = selectAtom(anAtom, mapping);
    const [result] = useAtom(mappedAtom);
    return result;
};
