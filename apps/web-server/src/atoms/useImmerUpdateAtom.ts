import produce, { Draft } from 'immer';
import { WritableAtom } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import React from 'react';

export const useImmerUpdateAtom = <Value, Result extends void | Promise<void>>(
    anAtom: WritableAtom<Value, (value: Value) => Value, Result>
) => {
    const updateAtom = useUpdateAtom(anAtom);
    const setWithImmer = React.useCallback(
        (recipe: (x: Draft<Value>) => void) =>
            updateAtom(atomValue => produce(atomValue, draft => recipe(draft))),
        [updateAtom]
    );
    return setWithImmer;
};
