"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.ensureAuthorizedUser = exports.findRoomAndMyParticipant = exports.checkEntry = exports.getUserIfEntry = exports.checkSignInAndNotAnonymous = exports.checkSignIn = exports.AnonymousAccount = exports.NotSignIn = void 0;
const mikro_orm_1 = require("../../entities/user/mikro-orm");
const mikro_orm_2 = require("../../entities/room/mikro-orm");
const global_1 = require("../../entities/room/global");
const util_1 = require("@kizahasi/util");
const config_1 = require("../../../config");
const configType_1 = require("../../../configType");
const safe_compare_1 = __importDefault(require("safe-compare"));
const bcrypt_1 = __importDefault(require("bcrypt"));
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
const getUserIfEntry = async ({ em, userUid, baasType, noFlush, }) => {
    const serverConfig = await config_1.loadServerConfigAsMain();
    const user = await em.findOne(mikro_orm_1.User, { userUid, baasType });
    const requiresEntryPassword = serverConfig.entryPassword != null;
    if (user == null) {
        if (!requiresEntryPassword) {
            const newUser = new mikro_orm_1.User({ userUid, baasType });
            newUser.isEntry = true;
            if (noFlush === true) {
                em.persist(newUser);
            }
            else {
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
exports.getUserIfEntry = getUserIfEntry;
const checkEntry = async ({ em, userUid, baasType, noFlush, }) => {
    return (await exports.getUserIfEntry({ em, userUid, baasType, noFlush })) != null;
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
const ensureAuthorizedUser = (context) => {
    if (context.authorizedUser == null) {
        throw new Error('authorizedUser was not found. "@Attribute" might be missing.');
    }
    return context.authorizedUser;
};
exports.ensureAuthorizedUser = ensureAuthorizedUser;
const comparePassword = async (plainPassword, config) => {
    if (config.type === configType_1.plain) {
        return safe_compare_1.default(plainPassword, config.value);
    }
    return await bcrypt_1.default.compare(plainPassword, config.value);
};
exports.comparePassword = comparePassword;
