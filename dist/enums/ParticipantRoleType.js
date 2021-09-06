"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nullableStringToParticipantRoleType = exports.stringToParticipantRoleType = exports.ParticipantRoleType = void 0;
const flocon_core_1 = require("@kizahasi/flocon-core");
var ParticipantRoleType;
(function (ParticipantRoleType) {
    ParticipantRoleType["Master"] = "Master";
    ParticipantRoleType["Player"] = "Player";
    ParticipantRoleType["Spectator"] = "Spectator";
})(ParticipantRoleType = exports.ParticipantRoleType || (exports.ParticipantRoleType = {}));
const stringToParticipantRoleType = (source) => {
    switch (source) {
        case flocon_core_1.Master:
            return ParticipantRoleType.Master;
        case flocon_core_1.Player:
            return ParticipantRoleType.Player;
        case flocon_core_1.Spectator:
            return ParticipantRoleType.Spectator;
    }
};
exports.stringToParticipantRoleType = stringToParticipantRoleType;
const nullableStringToParticipantRoleType = (source) => {
    switch (source) {
        case flocon_core_1.Master:
            return ParticipantRoleType.Master;
        case flocon_core_1.Player:
            return ParticipantRoleType.Player;
        case flocon_core_1.Spectator:
            return ParticipantRoleType.Spectator;
        default:
            return source;
    }
};
exports.nullableStringToParticipantRoleType = nullableStringToParticipantRoleType;
