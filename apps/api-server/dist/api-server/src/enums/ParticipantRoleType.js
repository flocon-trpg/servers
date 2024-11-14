'use strict';

var FilePathModule = require('@flocon-trpg/core');

exports.ParticipantRoleType = void 0;
(function (ParticipantRoleType) {
    ParticipantRoleType["Master"] = "Master";
    ParticipantRoleType["Player"] = "Player";
    ParticipantRoleType["Spectator"] = "Spectator";
})(exports.ParticipantRoleType || (exports.ParticipantRoleType = {}));
const stringToParticipantRoleType = (source) => {
    switch (source) {
        case FilePathModule.Master:
            return exports.ParticipantRoleType.Master;
        case FilePathModule.Player:
            return exports.ParticipantRoleType.Player;
        case FilePathModule.Spectator:
            return exports.ParticipantRoleType.Spectator;
    }
};
const nullableStringToParticipantRoleType = (source) => {
    switch (source) {
        case FilePathModule.Master:
            return exports.ParticipantRoleType.Master;
        case FilePathModule.Player:
            return exports.ParticipantRoleType.Player;
        case FilePathModule.Spectator:
            return exports.ParticipantRoleType.Spectator;
        default:
            return source;
    }
};

exports.nullableStringToParticipantRoleType = nullableStringToParticipantRoleType;
exports.stringToParticipantRoleType = stringToParticipantRoleType;
//# sourceMappingURL=ParticipantRoleType.js.map
