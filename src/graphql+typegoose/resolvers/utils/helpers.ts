import { anonymous } from '../../../@shared/Constants';
import { DecodedIdToken, ResolverContext } from '../../../graphql+typegoose/utils/Contexts';
import admin from 'firebase-admin';
import { EM } from '../../../utils/types';
import { User } from '../../entities/user/mikro-orm';
import { Room } from '../../entities/room/mikro-orm';
import { __ } from '../../../@shared/collection';
import { Participant } from '../../entities/participant/mikro-orm';
import { serverConfig } from '../../../config';
import { Reference } from '@mikro-orm/core';

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
export const getUserIfEntry = async ({ em, userUid }: { em: EM; userUid: string }): Promise<User | null> => {
    const user = await em.findOne(User, { userUid });

    if (user == null) {
        if (serverConfig.globalEntryPhrase == null) {
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

    if (serverConfig.globalEntryPhrase == null) {
        user.isEntry = true;
        return user;
    }

    return null;
};

export const checkEntry = async ({ em, userUid }: { em: EM; userUid: string }): Promise<boolean> => {
    return (await getUserIfEntry({ em, userUid })) != null;
};

export const findRoomAndMyParticipant = async ({
    em,
    userUid,
    roomId
}: {
    em: EM;
    userUid: string;
    roomId: string;
}): Promise<{ room: Room; me?: Participant } | null> => {
    const room = await em.findOne(Room, { id: roomId });
    if (room == null) {
        return null;
    }
    const participants = await room.participants.loadItems();
    const me = await __(participants).findOrUndefinedAsync(async p => {
        const loadedUserUid = await p.user.load('userUid');
        return loadedUserUid === userUid;
    });
    return { room, me };
};

export const findRoomAndMyParticipantAndParitipantUserUids = async ({
    em,
    userUid,
    roomId
}: {
    em: EM;
    userUid: string;
    roomId: string;
}): Promise<{ room: Room; me?: Participant; participantUsers: Reference<User>[]; participantUserUids: ReadonlySet<string> } | null> => {
    const room = await em.findOne(Room, { id: roomId });
    if (room == null) {
        return null;
    }
    const participants = await room.participants.loadItems();
    const participantUserUids: { participant: Participant; userUid: string }[] = [];
    const participantUsers: Reference<User>[] = [];
    for (const participant of participants) {
        participantUsers.push(participant.user);
        const loadedUserUid = await participant.user.load('userUid');
        participantUserUids.push({ participant, userUid: loadedUserUid });
    }
    const me = participantUserUids.find(({ userUid: loadedUserUid }) => loadedUserUid === userUid);
    return {
        room,
        me: me?.participant,
        participantUsers: participantUsers,
        participantUserUids: new Set(participantUserUids.map(({ userUid }) => userUid))
    };
};

export const maskValue = <T>({
    createdByMe,
    isPrevValuePrivate,
    nextValue,
    isNextValuePrivate,
    valueWhenHidden,
}: {
    createdByMe: boolean;
    isPrevValuePrivate: boolean;
    nextValue: T;
    isNextValuePrivate: boolean;
    valueWhenHidden: T;
}): T | undefined => {
    if (createdByMe) {
        return nextValue;
    }
    if (isPrevValuePrivate && isNextValuePrivate) {
        return undefined;
    }
    if (isPrevValuePrivate && !isNextValuePrivate) {
        return nextValue;
    }
    if (!isPrevValuePrivate && isNextValuePrivate) {
        return valueWhenHidden;
    }
    return nextValue;
};