"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maskValue = exports.findRoomAndMyParticipantAndParitipantUserUids = exports.findRoomAndMyParticipant = exports.checkEntry = exports.getUserIfEntry = exports.checkSignInAndNotAnonymous = exports.checkSignIn = exports.AnonymousAccount = exports.NotSignIn = void 0;
const Constants_1 = require("../../../@shared/Constants");
const mikro_orm_1 = require("../../entities/user/mikro-orm");
const mikro_orm_2 = require("../../entities/room/mikro-orm");
const collection_1 = require("../../../@shared/collection");
exports.NotSignIn = 'NotSignIn';
exports.AnonymousAccount = 'AnonymousAccount';
const checkSignIn = (context) => {
    if (context.decodedIdToken == null || context.decodedIdToken.isError) {
        return exports.NotSignIn;
    }
    return context.decodedIdToken.value;
};
exports.checkSignIn = checkSignIn;
const checkSignInAndNotAnonymous = (context) => {
    const decodedIdToken = exports.checkSignIn(context);
    if (decodedIdToken == exports.NotSignIn) {
        return exports.NotSignIn;
    }
    if (decodedIdToken.firebase.sign_in_provider === Constants_1.anonymous) {
        return exports.AnonymousAccount;
    }
    return decodedIdToken;
};
exports.checkSignInAndNotAnonymous = checkSignInAndNotAnonymous;
const getUserIfEntry = async ({ em, userUid, globalEntryPhrase }) => {
    const user = await em.findOne(mikro_orm_1.User, { userUid });
    if (user == null) {
        if (globalEntryPhrase == null) {
            const newUser = new mikro_orm_1.User({ userUid });
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
exports.getUserIfEntry = getUserIfEntry;
const checkEntry = async ({ em, userUid, globalEntryPhrase }) => {
    return (await exports.getUserIfEntry({ em, userUid, globalEntryPhrase })) != null;
};
exports.checkEntry = checkEntry;
const findRoomAndMyParticipant = async ({ em, userUid, roomId }) => {
    const room = await em.findOne(mikro_orm_2.Room, { id: roomId });
    if (room == null) {
        return null;
    }
    const participants = await room.particis.loadItems();
    const me = await collection_1.__(participants).findOrUndefinedAsync(async (p) => {
        const loadedUserUid = await p.user.load('userUid');
        return loadedUserUid === userUid;
    });
    return { room, me };
};
exports.findRoomAndMyParticipant = findRoomAndMyParticipant;
const findRoomAndMyParticipantAndParitipantUserUids = async ({ em, userUid, roomId }) => {
    const room = await em.findOne(mikro_orm_2.Room, { id: roomId });
    if (room == null) {
        return null;
    }
    const participants = await room.particis.loadItems();
    const participantUserUids = [];
    const participantUsers = [];
    for (const participant of participants) {
        participantUsers.push(participant.user);
        const loadedUserUid = await participant.user.load('userUid');
        participantUserUids.push({ participant, userUid: loadedUserUid });
    }
    const me = participantUserUids.find(({ userUid: loadedUserUid }) => loadedUserUid === userUid);
    return {
        room,
        me: me === null || me === void 0 ? void 0 : me.participant,
        participantUsers: participantUsers,
        participantUserUids: new Set(participantUserUids.map(({ userUid }) => userUid))
    };
};
exports.findRoomAndMyParticipantAndParitipantUserUids = findRoomAndMyParticipantAndParitipantUserUids;
const maskValue = ({ createdByMe, isPrevValuePrivate, nextValue, isNextValuePrivate, valueWhenHidden, }) => {
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
exports.maskValue = maskValue;
