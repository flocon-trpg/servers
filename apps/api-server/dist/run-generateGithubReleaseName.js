'use strict';

var fs = require('fs-extra');
var gitTags = require('./api-server/src/gitTags.js');

const main = () => {
    const txt = `Web サーバー ${gitTags.getWebServerTag()} & API サーバー ${gitTags.getApiServerTag()}`;
    fs.writeFileSync('./github-release-name.txt', txt);
};
main();
//# sourceMappingURL=run-generateGithubReleaseName.js.map
