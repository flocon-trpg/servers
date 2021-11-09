import { ReadonlyStateMap } from '@flocon-trpg/utils';
import { CharacterState } from '@flocon-trpg/core';
import { useCreateStateMap } from '../useCreateStateMap';
import { useAtomSelector } from '../../atoms/useAtomSelector';
import { roomAtom } from '../../atoms/room/roomAtom';

export const useCharacters = (): ReadonlyStateMap<CharacterState> | undefined => {
    const participants = useAtomSelector(roomAtom, state => state.roomState?.state?.participants);
    return useCreateStateMap(participants ?? {}, x => x.characters);
};
