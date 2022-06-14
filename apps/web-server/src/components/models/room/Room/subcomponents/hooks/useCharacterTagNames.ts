import React from 'react';
import { roomAtom } from '../../../../../../atoms/roomAtom/roomAtom';
import { useAtomSelector } from '../../../../../../hooks/useAtomSelector';
import { CharacterTagNames } from '../../../../../../utils/types';

export function useCharacterTagNames(): Partial<CharacterTagNames> {
    const characterTag1Name = useAtomSelector(
        roomAtom,
        state => state?.roomState?.state?.characterTag1Name
    );
    const characterTag2Name = useAtomSelector(
        roomAtom,
        state => state?.roomState?.state?.characterTag2Name
    );
    const characterTag3Name = useAtomSelector(
        roomAtom,
        state => state?.roomState?.state?.characterTag3Name
    );
    const characterTag4Name = useAtomSelector(
        roomAtom,
        state => state?.roomState?.state?.characterTag4Name
    );
    const characterTag5Name = useAtomSelector(
        roomAtom,
        state => state?.roomState?.state?.characterTag5Name
    );
    const characterTag6Name = useAtomSelector(
        roomAtom,
        state => state?.roomState?.state?.characterTag6Name
    );
    const characterTag7Name = useAtomSelector(
        roomAtom,
        state => state?.roomState?.state?.characterTag7Name
    );
    const characterTag8Name = useAtomSelector(
        roomAtom,
        state => state?.roomState?.state?.characterTag8Name
    );
    const characterTag9Name = useAtomSelector(
        roomAtom,
        state => state?.roomState?.state?.characterTag9Name
    );
    const characterTag10Name = useAtomSelector(
        roomAtom,
        state => state?.roomState?.state?.characterTag10Name
    );

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
