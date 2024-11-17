import fs from 'fs-extra';
import { getApiServerVersion, getWebServerVersion } from './gitTags';

const main = (): void => {
    const txt = `Web サーバー v${getWebServerVersion()} & API サーバー v${getApiServerVersion()}`;
    fs.writeFileSync('./github-release-name.txt', txt);
};

main();
