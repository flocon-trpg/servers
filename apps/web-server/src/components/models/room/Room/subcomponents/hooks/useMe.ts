import { useMyUserUid } from '../../../../../../hooks/useMyUserUid';
import { useParticipants } from './useParticipants';

export const useMe = () => {
    const myUserUid = useMyUserUid();
    const participantsMap = useParticipants();
    return myUserUid == null ? undefined : participantsMap?.get(myUserUid);
};
