import { Draft, produce } from 'immer';
import { useSetAtom } from 'jotai/react';
import { WritableAtom } from 'jotai/vanilla';
import { useCallbackOne } from 'use-memo-one';

export const useImmerSetAtom = <Value, Result extends void | Promise<void>>(
    anAtom: WritableAtom<Value, [(value: Value) => Value], Result>
) => {
    const setAtom = useSetAtom(anAtom);
    const setWithImmer = useCallbackOne(
        (recipe: (x: Draft<Value>) => void) =>
            setAtom(atomValue => produce(atomValue, draft => recipe(draft))),
        [setAtom]
    );
    return setWithImmer;
};
