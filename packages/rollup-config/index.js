"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = config;
const plugin_typescript_1 = __importDefault(require("@rollup/plugin-typescript"));
/**
 * @example
 * ```javascript
const { config } = require('@flocon-trpg/rollup-config');
// https://rollupjs.org/guide/en/#importing-packagejson
const external = Object.keys(require('./package.json').dependencies);
module.exports = config({ external });
 * ```
 */
function config({ external }) {
    const input = 'src/index.ts';
    const config = ({ dir, format }) => ({
        input,
        output: {
            dir,
            format,
            interop: 'auto',
            sourcemap: true,
        },
        external,
        plugins: [
            (0, plugin_typescript_1.default)({
                exclude: '**/*.test.ts',
                compilerOptions: {
                    declaration: true,
                    declarationMap: true,
                    outDir: dir,
                    rootDir: 'src',
                },
            }),
        ],
    });
    // @rollup/plugin-typescriptでdeclarationのみを出力するにはnoForceEmitをtrueにする必要がある。
    // だがそうすると原因は不明だがTypeScriptを正常に解釈できずエラーとなってしまうため、d.tsファイルはcjsとesmに付属させている。
    return [
        config({ dir: 'dist/esm', format: 'esm' }),
        config({
            dir: 'dist/cjs',
            format: 'cjs',
        }),
    ];
}
//# sourceMappingURL=index.js.map