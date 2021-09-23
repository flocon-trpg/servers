import { DecodedIdToken, ResolverContext } from '../../utils/Contexts';
import { EM } from '../../../utils/types';
import { User } from '../../entities/user/mikro-orm';
import { Room } from '../../entities/room/mikro-orm';
import { GlobalRoom } from '../../entities/room/global';
import { ParticipantState, State } from '@kizahasi/flocon-core';
import { anonymous, recordToArray } from '@kizahasi/util';
import { BaasType } from '../../../enums/BaasType';
import { EntryPasswordConfig, plain, ServerConfig } from '../../../configType';
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
    serverConfig,
    noFlush,
}: {
    em: EM;
    userUid: string;
    baasType: BaasType;
    serverConfig: ServerConfig;
    noFlush?: boolean;
}): Promise<User | null> => {
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
            return newUser;
        }
        return null;
    }

    if (user.isEntry) {
        return user;
    }

    if (!requiresEntryPassword) {
        user.isEntry = true;
        if (noFlush !== true) {
            await em.flush();
        }
        return user;
    }

    return null;
};

export const checkEntry = async ({
    em,
    userUid,
    baasType,
    serverConfig,
    noFlush,
}: {
    em: EM;
    userUid: string;
    baasType: BaasType;
    serverConfig: ServerConfig;
    noFlush?: boolean;
}): Promise<boolean> => {
    return (await getUserIfEntry({ em, userUid, baasType, serverConfig, noFlush })) != null;
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
    const state = await GlobalRoom.MikroORM.ToGlobal.state(room, em);
    const me = find(state.participants, userUid);
    return new FindRoomAndMyParticipantResult(room, state, me);
};

export const ensureUserUid = (context: ResolverContext): string => {
    const decodedIdToken = checkSignIn(context);
    if (decodedIdToken === NotSignIn) {
        throw new Error('Not sign in. "@Attribute()" might be missing.');
    }
    return decodedIdToken.uid;
};

export const ensureAuthorizedUser = (context: ResolverContext): User => {
    if (context.authorizedUser == null) {
        throw new Error(
            'authorizedUser was not found. "@Attribute(ENTRY or ADMIN)" might be missing.'
        );
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
