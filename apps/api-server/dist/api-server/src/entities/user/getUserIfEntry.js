'use strict';

var entity = require('./entity.js');

const getUserIfEntry = async ({ em, userUid, baasType, serverConfig, noFlush, }) => {
    const user = await em.findOne(entity.User, { userUid, baasType });
    const requiresEntryPassword = serverConfig.entryPassword != null;
    if (user == null) {
        if (!requiresEntryPassword) {
            const newUser = new entity.User({ userUid, baasType });
            newUser.isEntry = true;
            if (noFlush === true) {
                em.persist(newUser);
            }
            else {
                await em.persistAndFlush(newUser);
            }
            return newUser;
        }
        return null;
    }
    if (user.isEntry) {
        return user;
    }
    if (!requiresEntryPassword) {
        user.isEntry = true;
        if (noFlush !== true) {
            await em.flush();
        }
        return user;
    }
    return null;
};

exports.getUserIfEntry = getUserIfEntry;
//# sourceMappingURL=getUserIfEntry.js.map
