const { pathsToModuleNameMapper } = require('ts-jest');
const fs = require('fs');

// require 関数は JSON に対応しているが JSON5 には対応していないため、コメントを表す // でエラーが出る。そのため、require 関数は使わず、テキストファイルとして読み込んでから // からなるコメント行を取り除いている。
// なお、/* */ によるコメントは取り除いていないため、tsconfig.json に書いてはならない。
const tsconfigText = fs
    .readFileSync('./tsconfig.json', 'utf8')
    .toString()
    .replace(/^\s*(\/\/.*)$/gm, '');
const tsconfig = JSON.parse(tsconfigText);

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$', // javascriptファイルのテストを回避している
    moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths, {
        prefix: '<rootDir>/',
    }),
};
