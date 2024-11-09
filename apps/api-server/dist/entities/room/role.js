'use strict';

const role = async ({ roomEntity, myUserUid }) => {
    const me = (await roomEntity.participants.init({ where: { user: { userUid: myUserUid } } }))[0];
    return me?.role;
};

exports.role = role;
//# sourceMappingURL=role.js.map
