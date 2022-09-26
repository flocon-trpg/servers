import { VERSION } from './src/VERSION';
import fs from 'fs-extra';

const main = (): void => {
    const version = VERSION.toString();
    const text = `FROM kizahasi/flocon-api-swap256mb:v${version}`;
    fs.writeFileSync('./flyio.Dockerfile', text);
};

main();
