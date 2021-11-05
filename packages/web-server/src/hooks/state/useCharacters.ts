import { ReadonlyStateMap } from '@flocon-trpg/utils';
import { CharacterState } from '@flocon-trpg/core';
import { useSelector } from '../../store';
import { useCreateStateMap } from '../useCreateStateMap';

export const useCharacters = (): ReadonlyStateMap<CharacterState> | undefined => {
    const participants = useSelector(state => state.roomModule.roomState?.state?.participants);
    return useCreateStateMap(participants ?? {}, x => x.characters);
};
