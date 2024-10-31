import { useAtomValue } from 'jotai/react';
import { Atom, atom, createStore } from 'jotai/vanilla';

type Store = ReturnType<typeof createStore>;

type Options = {
    store?: Store;
};

/** @deprecated */
export const useAtomSelector = <T1, T2>(
    anAtom: Atom<T1 | Promise<T1>>,
    mapping: (value: T1) => T2,
    options?: Options,
) => {
    const atomValue = useAtomValue(
        anAtom,
        options?.store == null ? undefined : { store: options.store },
    );
    return mapping(atomValue);
};
