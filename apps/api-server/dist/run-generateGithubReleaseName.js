'use strict';

var fs = require('fs-extra');
var gitTags = require('./api-server/src/gitTags.js');

const main = () => {
    const txt = `Web サーバー v${gitTags.getWebServerVersion()} & API サーバー v${gitTags.getApiServerVersion()}`;
    fs.writeFileSync('./github-release-name.txt', txt);
};
main();
//# sourceMappingURL=run-generateGithubReleaseName.js.map
