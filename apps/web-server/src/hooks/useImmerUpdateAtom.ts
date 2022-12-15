import { Draft, produce } from 'immer';
import { WritableAtom, useSetAtom } from 'jotai';
import React from 'react';

export const useImmerUpdateAtom = <Value, Result extends void | Promise<void>>(
    anAtom: WritableAtom<Value, (value: Value) => Value, Result>
) => {
    const updateAtom = useSetAtom(anAtom);
    const setWithImmer = React.useCallback(
        (recipe: (x: Draft<Value>) => void) =>
            updateAtom(atomValue => produce(atomValue, draft => recipe(draft))),
        [updateAtom]
    );
    return setWithImmer;
};
