// tsconfig.json の paths を無効化しているので、paths に関わる部分をコメントアウト

// const { pathsToModuleNameMapper } = require('ts-jest');
// const { compilerOptions } = require('./tsconfig');

module.exports = {
    preset: 'ts-jest',
    // moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
};
