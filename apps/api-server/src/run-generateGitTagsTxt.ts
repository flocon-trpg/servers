import fs from 'fs-extra';
import { getApiServerTag, getMainTag, getWebServerTag } from './gitTags';

const main = (): void => {
    const txt = `Main: ${getMainTag()} 
Web Server: ${getWebServerTag()}
API Server: ${getApiServerTag()}`;

    fs.writeFileSync('./git-tags.txt', txt);
};

main();
