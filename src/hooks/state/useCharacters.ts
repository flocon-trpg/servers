import { ReadonlyStateMap } from '@kizahasi/util';
import { CharacterState } from '@kizahasi/flocon-core';
import { useSelector } from '../../store';
import { useCreateStateMap } from '../useCreateStateMap';

export const useCharacters = (): ReadonlyStateMap<CharacterState> | undefined => {
    const participants = useSelector(state => state.roomModule.roomState?.state?.participants);
    return useCreateStateMap(participants ?? {}, x => x.characters);
};
