"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findRoomAndMyParticipant = exports.checkEntry = exports.getUserIfEntry = exports.checkSignInAndNotAnonymous = exports.checkSignIn = exports.AnonymousAccount = exports.NotSignIn = void 0;
const mikro_orm_1 = require("../../entities/user/mikro-orm");
const mikro_orm_2 = require("../../entities/room/mikro-orm");
const global_1 = require("../../entities/room/global");
const util_1 = require("@kizahasi/util");
const find = (source, key) => source[key];
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
    if (decodedIdToken.firebase.sign_in_provider === util_1.anonymous) {
        return exports.AnonymousAccount;
    }
    return decodedIdToken;
};
exports.checkSignInAndNotAnonymous = checkSignInAndNotAnonymous;
const getUserIfEntry = async ({ em, userUid, baasType, globalEntryPhrase, }) => {
    const user = await em.findOne(mikro_orm_1.User, { userUid, baasType });
    if (user == null) {
        if (globalEntryPhrase == null) {
            const newUser = new mikro_orm_1.User({ userUid, baasType });
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
const checkEntry = async ({ em, userUid, baasType, globalEntryPhrase, }) => {
    return (await exports.getUserIfEntry({ em, userUid, baasType, globalEntryPhrase })) != null;
};
exports.checkEntry = checkEntry;
class FindRoomAndMyParticipantResult {
    constructor(room, roomState, me) {
        this.room = room;
        this.roomState = roomState;
        this.me = me;
    }
    participantIds() {
        return new Set(util_1.recordToArray(this.roomState.participants).map(({ key }) => key));
    }
}
const findRoomAndMyParticipant = async ({ em, userUid, roomId, }) => {
    const room = await em.findOne(mikro_orm_2.Room, { id: roomId });
    if (room == null) {
        return null;
    }
    const state = global_1.GlobalRoom.MikroORM.ToGlobal.state(room);
    const me = find(state.participants, userUid);
    return new FindRoomAndMyParticipantResult(room, state, me);
};
exports.findRoomAndMyParticipant = findRoomAndMyParticipant;
