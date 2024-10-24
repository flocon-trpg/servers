'use strict';

var utils = require('@flocon-trpg/utils');
require('reflect-metadata');
var main = require('./main.js');
var commandLineArgs = require('./utils/commandLineArgs.js');

void commandLineArgs.loadAsMain().then(args => {
    main.main(args).catch((err) => utils.loggerRef.error(err));
});
//# sourceMappingURL=index.js.map
