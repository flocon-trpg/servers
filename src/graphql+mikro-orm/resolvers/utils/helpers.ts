import { DecodedIdToken, ResolverContext } from '../../utils/Contexts';
import { EM } from '../../../utils/types';
import { User } from '../../entities/user/mikro-orm';
import { Room } from '../../entities/room/mikro-orm';
import { GlobalRoom } from '../../entities/room/global';
import { ParticipantState, State } from '@kizahasi/flocon-core';
import {anonymous, recordToArray} from '@kizahasi/util';

const find = <T>(source: Record<string, T | undefined>, key: string): T | undefined => source[key];

export const NotSignIn = 'NotSignIn';
export const AnonymousAccount = 'AnonymousAccount';

export const checkSignIn = (context: ResolverContext): DecodedIdToken | typeof NotSignIn => {
    if (context.decodedIdToken == null || context.decodedIdToken.isError) {
        return NotSignIn;
    }
    return context.decodedIdToken.value;
};

export const checkSignInAndNotAnonymous = (context: ResolverContext): DecodedIdToken | typeof NotSignIn | typeof AnonymousAccount => {
    const decodedIdToken = checkSignIn(context);
    if (decodedIdToken == NotSignIn) {
        return NotSignIn;
    }
    if (decodedIdToken.firebase.sign_in_provider === anonymous) {
        return AnonymousAccount;
    }
    return decodedIdToken;
};

// Userが見つかっても、entryしていなかったらnullを返す。
export const getUserIfEntry = async ({ em, userUid, globalEntryPhrase }: { em: EM; userUid: string; globalEntryPhrase: string | undefined }): Promise<User | null> => {
    const user = await em.findOne(User, { userUid });

    if (user == null) {
        if (globalEntryPhrase == null) {
            const newUser = new User({ userUid });
            newUser.isEntry = true;
            em.persist(newUser);
            return user;
        }
        return null;
    }

    if (user.isEntry) {
        return user;
    }

    if (globalEntryPhrase == null) {
        user.isEntry = true;
        return user;
    }

    return null;
};

export const checkEntry = async ({ em, userUid, globalEntryPhrase }: { em: EM; userUid: string; globalEntryPhrase: string | undefined }): Promise<boolean> => {
    return (await getUserIfEntry({ em, userUid, globalEntryPhrase })) != null;
};

class FindRoomAndMyParticipantResult {
    public constructor(public readonly room: Room, public readonly roomState: State, public readonly me?: ParticipantState) {

    }

    public participantIds(): Set<string> {
        return new Set(recordToArray(this.roomState.participants).map(({ key }) => key));
    }
}

export const findRoomAndMyParticipant = async ({
    em,
    userUid,
    roomId
}: {
    em: EM;
    userUid: string;
    roomId: string;
}): Promise<FindRoomAndMyParticipantResult | null> => {
    const room = await em.findOne(Room, { id: roomId });
    if (room == null) {
        return null;
    }
    const state = GlobalRoom.MikroORM.ToGlobal.state(room);
    const me = find(state.participants, userUid);
    return new FindRoomAndMyParticipantResult(room, state, me);
};