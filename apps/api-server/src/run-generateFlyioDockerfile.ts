import fs from 'fs-extra';
import { VERSION } from './VERSION';

const main = (): void => {
    const version = VERSION.toString();
    const text = `FROM kizahasi/flocon-api-swap256mb:v${version}`;
    fs.writeFileSync('./flyio.Dockerfile', text);
};

main();
