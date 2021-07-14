import { useParticipants } from './state/useParticipants';
import { useMyUserUid } from './useMyUserUid';

export const useMe = () => {
    const myUserUid = useMyUserUid();
    const participantsMap = useParticipants();
    return myUserUid == null ? undefined : participantsMap?.get(myUserUid);
};
