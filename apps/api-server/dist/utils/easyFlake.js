'use strict';

var uuid = require('uuid');

const easyFlake = () => {
    return `${new Date().getTime()}_${uuid.v4()}`;
};

exports.easyFlake = easyFlake;
//# sourceMappingURL=easyFlake.js.map
