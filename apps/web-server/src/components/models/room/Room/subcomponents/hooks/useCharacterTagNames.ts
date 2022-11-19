import React from 'react';
import { useRoomStateValueSelector } from '@/hooks/useRoomStateValueSelector';
import { CharacterTagNames } from '@/utils/types';

export function useCharacterTagNames(): Partial<CharacterTagNames> {
    const characterTag1Name =
        useRoomStateValueSelector(state => state.characterTag1Name) ?? undefined;
    const characterTag2Name =
        useRoomStateValueSelector(state => state.characterTag2Name) ?? undefined;
    const characterTag3Name =
        useRoomStateValueSelector(state => state.characterTag3Name) ?? undefined;
    const characterTag4Name =
        useRoomStateValueSelector(state => state.characterTag4Name) ?? undefined;
    const characterTag5Name =
        useRoomStateValueSelector(state => state.characterTag5Name) ?? undefined;
    const characterTag6Name =
        useRoomStateValueSelector(state => state.characterTag6Name) ?? undefined;
    const characterTag7Name =
        useRoomStateValueSelector(state => state.characterTag7Name) ?? undefined;
    const characterTag8Name =
        useRoomStateValueSelector(state => state.characterTag8Name) ?? undefined;
    const characterTag9Name =
        useRoomStateValueSelector(state => state.characterTag9Name) ?? undefined;
    const characterTag10Name =
        useRoomStateValueSelector(state => state.characterTag10Name) ?? undefined;

    const [resultState, setResultState] = React.useState<Partial<CharacterTagNames>>({});

    React.useEffect(() => {
        setResultState({
            characterTag1Name,
            characterTag2Name,
            characterTag3Name,
            characterTag4Name,
            characterTag5Name,
            characterTag6Name,
            characterTag7Name,
            characterTag8Name,
            characterTag9Name,
            characterTag10Name,
        });
    }, [
        characterTag1Name,
        characterTag2Name,
        characterTag3Name,
        characterTag4Name,
        characterTag5Name,
        characterTag6Name,
        characterTag7Name,
        characterTag8Name,
        characterTag9Name,
        characterTag10Name,
    ]);

    return resultState;
}
