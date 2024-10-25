'use strict';

const isBookmarked = async ({ roomEntity, myUserUid, }) => {
    return (await roomEntity.bookmarkedBy.init({ where: { userUid: myUserUid } })).count() !== 0;
};

exports.isBookmarked = isBookmarked;
//# sourceMappingURL=isBookmarked.js.map
