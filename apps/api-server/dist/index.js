'use strict';

var utils = require('@flocon-trpg/utils');
require('reflect-metadata');
var main = require('./api-server/src/main.js');
var commandLineArgs = require('./api-server/src/utils/commandLineArgs.js');

void commandLineArgs.loadAsMain().then(args => {
    main.main(args).catch((err) => utils.loggerRef.error(err));
});
//# sourceMappingURL=index.js.map
