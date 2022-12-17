import { Draft, produce } from 'immer';
import { WritableAtom, useSetAtom } from 'jotai';
import { useCallbackOne } from 'use-memo-one';

export const useImmerUpdateAtom = <Value, Result extends void | Promise<void>>(
    anAtom: WritableAtom<Value, (value: Value) => Value, Result>
) => {
    const updateAtom = useSetAtom(anAtom);
    const setWithImmer = useCallbackOne(
        (recipe: (x: Draft<Value>) => void) =>
            updateAtom(atomValue => produce(atomValue, draft => recipe(draft))),
        [updateAtom]
    );
    return setWithImmer;
};
