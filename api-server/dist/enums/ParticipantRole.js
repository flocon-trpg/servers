"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipantRole = void 0;
const flocon_core_1 = require("@kizahasi/flocon-core");
var ParticipantRole;
(function (ParticipantRole) {
    ParticipantRole["Master"] = "Master";
    ParticipantRole["Player"] = "Player";
    ParticipantRole["Spectator"] = "Spectator";
})(ParticipantRole = exports.ParticipantRole || (exports.ParticipantRole = {}));
(function (ParticipantRole) {
    ParticipantRole.ofString = (source) => {
        switch (source) {
            case flocon_core_1.Master:
                return ParticipantRole.Master;
            case flocon_core_1.Player:
                return ParticipantRole.Player;
            case flocon_core_1.Spectator:
                return ParticipantRole.Spectator;
        }
    };
    ParticipantRole.ofNullishString = (source) => {
        switch (source) {
            case null:
            case undefined:
                return undefined;
            default:
                return ParticipantRole.ofString(source);
        }
    };
})(ParticipantRole = exports.ParticipantRole || (exports.ParticipantRole = {}));
