import { useParticipants } from './useParticipants';
import { useMyUserUid } from '../../../../../../hooks/useMyUserUid';

export const useMe = () => {
    const myUserUid = useMyUserUid();
    const participantsMap = useParticipants();
    return myUserUid == null ? undefined : participantsMap?.get(myUserUid);
};
