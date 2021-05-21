"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipantRole = void 0;
const ParticipantRoleModule = __importStar(require("../@shared/ot/room/participant/v1"));
var ParticipantRole;
(function (ParticipantRole) {
    ParticipantRole["Master"] = "Master";
    ParticipantRole["Player"] = "Player";
    ParticipantRole["Spectator"] = "Spectator";
})(ParticipantRole = exports.ParticipantRole || (exports.ParticipantRole = {}));
(function (ParticipantRole) {
    ParticipantRole.ofString = (source) => {
        switch (source) {
            case ParticipantRoleModule.Master:
                return ParticipantRole.Master;
            case ParticipantRoleModule.Player:
                return ParticipantRole.Player;
            case ParticipantRoleModule.Spectator:
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
