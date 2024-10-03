'use strict';

var fs = require('fs-extra');
var VERSION = require('./VERSION.js');

const main = () => {
    const version = VERSION.VERSION.toString();
    const text = `FROM kizahasi/flocon-api-swap256mb:v${version}`;
    fs.writeFileSync('./flyio.Dockerfile', text);
};
main();
//# sourceMappingURL=run-generateFlyioDockerfile.js.map
