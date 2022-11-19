'use strict';

require('reflect-metadata');
var main = require('./main.js');
var commandLineArgs = require('./utils/commandLineArgs.js');

commandLineArgs.loadAsMain().then(args => {
    main.main(args).catch(err => console.error(err));
});
//# sourceMappingURL=index.js.map
