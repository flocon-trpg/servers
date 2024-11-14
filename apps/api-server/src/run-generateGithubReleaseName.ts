import fs from 'fs-extra';
import { getApiServerTag, getMainTag, getWebServerTag } from './gitTags';

const main = (): void => {
    const txt = `Web サーバー ${getWebServerTag()} & API サーバー ${getApiServerTag()}`;
    fs.writeFileSync('./github-release-name.txt', txt);
};

main();
