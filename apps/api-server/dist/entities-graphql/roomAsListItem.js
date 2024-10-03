'use strict';

var isBookmarked = require('../entities/room/isBookmarked.js');
var role = require('../entities/room/role.js');

const stateToGraphQL = async ({ roomEntity, myUserUid, }) => {
    return {
        ...roomEntity,
        createdAt: roomEntity.createdAt?.getTime(),
        updatedAt: roomEntity.completeUpdatedAt?.getTime(),
        requiresPlayerPassword: roomEntity.playerPasswordHash != null,
        requiresSpectatorPassword: roomEntity.spectatorPasswordHash != null,
        role: await role.role({ roomEntity, myUserUid }),
        isBookmarked: await isBookmarked.isBookmarked({ roomEntity, myUserUid }),
    };
};

exports.stateToGraphQL = stateToGraphQL;
//# sourceMappingURL=roomAsListItem.js.map
