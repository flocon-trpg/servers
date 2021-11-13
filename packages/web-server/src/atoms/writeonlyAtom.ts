import { atom, WritableAtom } from 'jotai';

/** @deprecated */
export const writeonlyAtom = <Value, Update, Result extends void | Promise<void> = void>(
    source: WritableAtom<Value, Update, Result>
) => {
    return atom(null, (get, set, value: Update) => set(source, value));
};
