'use strict';

var fs = require('fs-extra');
var gitTags = require('./api-server/src/gitTags.js');

const main = () => {
    const txt = `Main: ${gitTags.getMainTag()} 
Web Server: ${gitTags.getWebServerTag()}
API Server: ${gitTags.getApiServerTag()}`;
    fs.writeFileSync('./git-tags.txt', txt);
};
main();
//# sourceMappingURL=run-generateGitTagsTxt.js.map
