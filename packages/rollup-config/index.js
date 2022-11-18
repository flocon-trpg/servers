'use strict';
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
exports.config = void 0;
const plugin_typescript_1 = __importDefault(require('@rollup/plugin-typescript'));
/**
 * @example
 * ```javascript
const main = require('@flocon-trpg/rollup-config');
// https://rollupjs.org/guide/en/#importing-packagejson
const external = Object.keys(require('./package.json').dependencies);
module.exports = main({ external });
 * ```
 */
function config({ external }) {
    const input = 'src/index.ts';
    const config = ({ dir, format }) => ({
        input,
        output: {
            dir,
            format,
            sourcemap: false,
            interop: 'auto',
        },
        external,
        plugins: [(0, plugin_typescript_1.default)({ compilerOptions: { sourceMap: false } })],
    });
    return [
        config({ dir: 'dist/esm', format: 'esm' }),
        config({
            dir: 'dist/cjs',
            format: 'cjs',
        }),
        {
            input,
            output: {
                dir: 'dist/types',
                format: 'esm',
                sourcemap: true,
            },
            external,
            plugins: [
                (0, plugin_typescript_1.default)({
                    exclude: '**/*.test.ts',
                    compilerOptions: {
                        declaration: true,
                        declarationMap: true,
                        emitDeclarationOnly: true,
                        rootDir: 'src',
                        declarationDir: 'dist/types',
                        sourceMap: true,
                    },
                }),
            ],
        },
    ];
}
exports.config = config;
//# sourceMappingURL=index.js.map
