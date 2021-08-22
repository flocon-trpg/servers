import { DecodedIdToken, ResolverContext } from '../../utils/Contexts';
import { EM } from '../../../utils/types';
import { User } from '../../entities/user/mikro-orm';
import { Room } from '../../entities/room/mikro-orm';
import { GlobalRoom } from '../../entities/room/global';
import { ParticipantState, State } from '@kizahasi/flocon-core';
import { anonymous, recordToArray } from '@kizahasi/util';
import { BaasType } from '../../../enums/BaasType';
import { loadServerConfigAsMain } from '../../../config';
import { EntryPasswordConfig, plain } from '../../../configType';
import { timingSafeEqual } from 'crypto';
import safeCompare from 'safe-compare';
import bcrypt from 'bcrypt';

const find = <T>(source: Record<string, T | undefined>, key: string): T | undefined => source[key];

export const NotSignIn = 'NotSignIn';
export const AnonymousAccount = 'AnonymousAccount';

export const checkSignIn = (context: ResolverContext): DecodedIdToken | typeof NotSignIn => {
    if (context.decodedIdToken == null || context.decodedIdToken.isError) {
        return NotSignIn;
    }
    return context.decodedIdToken.value;
};

export const checkSignInAndNotAnonymous = (
    context: ResolverContext
): DecodedIdToken | typeof NotSignIn | typeof AnonymousAccount => {
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
export const getUserIfEntry = async ({
    em,
    userUid,
    baasType,
    noFlush,
}: {
    em: EM;
    userUid: string;
    baasType: BaasType;
    noFlush?: boolean;
}): Promise<User | null> => {
    const serverConfig = await loadServerConfigAsMain();
    const user = await em.findOne(User, { userUid, baasType });
    const requiresEntryPassword = serverConfig.entryPassword != null;

    if (user == null) {
        if (!requiresEntryPassword) {
            const newUser = new User({ userUid, baasType });
            newUser.isEntry = true;
            if (noFlush === true) {
                em.persist(newUser);
            } else {
                await em.persistAndFlush(newUser);
            }
            return user;
        }
        return null;
    }

    if (user.isEntry) {
        return user;
    }

    if (!requiresEntryPassword) {
        user.isEntry = true;
        return user;
    }

    return null;
};

export const checkEntry = async ({
    em,
    userUid,
    baasType,
    noFlush,
}: {
    em: EM;
    userUid: string;
    baasType: BaasType;
    noFlush?: boolean;
}): Promise<boolean> => {
    return (await getUserIfEntry({ em, userUid, baasType, noFlush })) != null;
};

class FindRoomAndMyParticipantResult {
    public constructor(
        public readonly room: Room,
        public readonly roomState: State,
        public readonly me?: ParticipantState
    ) {}

    public participantIds(): Set<string> {
        return new Set(recordToArray(this.roomState.participants).map(({ key }) => key));
    }
}

export const findRoomAndMyParticipant = async ({
    em,
    userUid,
    roomId,
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

export const ensureAuthorizedUser = (context: ResolverContext): User => {
    if (context.authorizedUser == null) {
        throw new Error('authorizedUser was not found. "@Attribute" might be missing.');
    }
    return context.authorizedUser;
};

export const comparePassword = async (
    plainPassword: string,
    config: EntryPasswordConfig
): Promise<boolean> => {
    if (config.type === plain) {
        return safeCompare(plainPassword, config.value);
    }
    return await bcrypt.compare(plainPassword, config.value);
};
