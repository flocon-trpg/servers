// This script extracts antd files to ./src/styles/css/tmp

const extract = require('extract-zip');
const fs = require('fs');
const path = require('path');

const dest = './src/styles/css/tmp';
const yarnCachePath = '../../.yarn/cache';

const [antdFile, ...antdFilesRest] = fs.readdirSync(yarnCachePath).filter(filename => {
    return filename.startsWith('antd-npm-') && filename.endsWith('.zip');
});

if (antdFile == null) {
    throw new Error(
        'antd file was not found at .yarn/cache. did you forget to run `yarn install`?'
    );
}

if (antdFilesRest.length !== 0) {
    throw new Error('too many antd files. try running `yarn install` again.');
}

console.log(`Extracting ${antdFile} to ${dest} ...`);
extract(path.join(yarnCachePath, antdFile), { dir: path.resolve(dest) });
