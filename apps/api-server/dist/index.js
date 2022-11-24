'use strict';

var utils = require('@flocon-trpg/utils');
require('reflect-metadata');
var main = require('./main.js');
var commandLineArgs = require('./utils/commandLineArgs.js');

commandLineArgs.loadAsMain().then(args => {
    main.main(args).catch(err => utils.loggerRef.value.error(err));
});
//# sourceMappingURL=index.js.map
