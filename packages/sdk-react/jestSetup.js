// @ltd/j-toml で TextDecoder が使われているが、jsdom には TextDecoder がない(https://github.com/jsdom/jsdom/issues/2524)ため、このファイルのようにセットしないとテストが失敗する。
const { TextDecoder } = require('util');
global.TextDecoder = TextDecoder;
