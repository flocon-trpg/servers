import { State } from '@flocon-trpg/core';
import produce from 'immer';
import { atom, useAtom } from 'jotai';
import React from 'react';
import { roomAtom } from '../atoms/room/roomAtom';

type Result = (stateOrRecipe: State | ((prevState: State) => void)) => void;

const emptyOperateAsStateWithImmer: Result = (): void => {
    throw new Error('useOperateAsState is not ready');
};

const operateAsStateAtom = atom(get => get(roomAtom).roomState?.operateAsState);

export const useOperateAsStateWithImmer = (): Result => {
    const [operateAsStateCore] = useAtom(operateAsStateAtom);
    return React.useMemo(() => {
        if (operateAsStateCore == null) {
            return emptyOperateAsStateWithImmer;
        }
        return (stateOrRecipe: State | ((prevState: State) => void)): void => {
            if (typeof stateOrRecipe === 'function') {
                operateAsStateCore(prevState => produce(prevState, stateOrRecipe));
                return;
            }
            operateAsStateCore(stateOrRecipe);
        };
    }, [operateAsStateCore]);
};
