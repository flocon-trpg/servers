"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stateToGraphQL = void 0;
const stateToGraphQL = ({ roomEntity, }) => {
    return Object.assign(Object.assign({}, roomEntity), { requiresPhraseToJoinAsPlayer: roomEntity.joinAsPlayerPhrase != null, requiresPhraseToJoinAsSpectator: roomEntity.joinAsSpectatorPhrase != null });
};
exports.stateToGraphQL = stateToGraphQL;
