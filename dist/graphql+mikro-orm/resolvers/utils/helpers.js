"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findRoomAndMyParticipant = exports.checkEntry = exports.getUserIfEntry = exports.checkSignInAndNotAnonymous = exports.checkSignIn = exports.AnonymousAccount = exports.NotSignIn = void 0;
const Constants_1 = require("../../../@shared/Constants");
const mikro_orm_1 = require("../../entities/user/mikro-orm");
const mikro_orm_2 = require("../../entities/room/mikro-orm");
const utils_1 = require("../../../@shared/utils");
const global_1 = require("../../entities/room/global");
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
class FindRoomAndMyParticipantResult {
    constructor(room, roomState, me) {
        this.room = room;
        this.roomState = roomState;
        this.me = me;
    }
    participantIds() {
        return new Set(utils_1.recordToArray(this.roomState).map(({ key }) => key));
    }
}
const findRoomAndMyParticipant = async ({ em, userUid, roomId }) => {
    const room = await em.findOne(mikro_orm_2.Room, { id: roomId });
    if (room == null) {
        return null;
    }
    const jsonState = global_1.GlobalRoom.MikroORM.ToGlobal.state(room);
    const me = find(jsonState.participants, userUid);
    return new FindRoomAndMyParticipantResult(room, Object.assign(Object.assign({}, jsonState), { name: room.name }), me);
};
exports.findRoomAndMyParticipant = findRoomAndMyParticipant;
