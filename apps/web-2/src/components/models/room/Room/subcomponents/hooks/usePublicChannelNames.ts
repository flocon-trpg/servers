import React from 'react';
import { useRoomStateValueSelector } from '@/hooks/useRoomStateValueSelector';
import { PublicChannelNames } from '@/utils/types';

export function usePublicChannelNames(): PublicChannelNames | null {
    const publicChannel1Name = useRoomStateValueSelector(state => state.publicChannel1Name);
    const publicChannel2Name = useRoomStateValueSelector(state => state.publicChannel2Name);
    const publicChannel3Name = useRoomStateValueSelector(state => state.publicChannel3Name);
    const publicChannel4Name = useRoomStateValueSelector(state => state.publicChannel4Name);
    const publicChannel5Name = useRoomStateValueSelector(state => state.publicChannel5Name);
    const publicChannel6Name = useRoomStateValueSelector(state => state.publicChannel6Name);
    const publicChannel7Name = useRoomStateValueSelector(state => state.publicChannel7Name);
    const publicChannel8Name = useRoomStateValueSelector(state => state.publicChannel8Name);
    const publicChannel9Name = useRoomStateValueSelector(state => state.publicChannel9Name);
    const publicChannel10Name = useRoomStateValueSelector(state => state.publicChannel10Name);

    const [resultState, setResultState] = React.useState<PublicChannelNames | null>(null);

    React.useEffect(() => {
        if (
            publicChannel1Name == null ||
            publicChannel2Name == null ||
            publicChannel3Name == null ||
            publicChannel4Name == null ||
            publicChannel5Name == null ||
            publicChannel6Name == null ||
            publicChannel7Name == null ||
            publicChannel8Name == null ||
            publicChannel9Name == null ||
            publicChannel10Name == null
        ) {
            setResultState(null);
            return;
        }
        setResultState({
            publicChannel1Name,
            publicChannel2Name,
            publicChannel3Name,
            publicChannel4Name,
            publicChannel5Name,
            publicChannel6Name,
            publicChannel7Name,
            publicChannel8Name,
            publicChannel9Name,
            publicChannel10Name,
        });
    }, [
        publicChannel1Name,
        publicChannel2Name,
        publicChannel3Name,
        publicChannel4Name,
        publicChannel5Name,
        publicChannel6Name,
        publicChannel7Name,
        publicChannel8Name,
        publicChannel9Name,
        publicChannel10Name,
    ]);

    return resultState;
}
