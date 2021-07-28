import fs from 'fs';

const toWrite = fs
    .readFileSync('./src/gen-source/richLogRenderJs.js')
    .toString()
    .split('\r\n')
    .filter(line => !line.startsWith('// eslint-disable-'))
    .reduce((seed, elem) => (seed === '' ? elem : `${seed}\r\n${elem}`), '')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
fs.writeFileSync('./src/generated/richLogRenderJs.ts', `export const richLogRenderJs = \`${toWrite}\`;`);
