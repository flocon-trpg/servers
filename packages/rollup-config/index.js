const typescript = require('@rollup/plugin-typescript');

/** 
 * @example
 * ```javascript
const main = require('@flocon-trpg/rollup-config');
// https://rollupjs.org/guide/en/#importing-packagejson
const external = Object.keys(require('./package.json').dependencies);
module.exports = main({ external });
 * ```
 */
const main = ({ external }) => {
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
        plugins: [typescript({ sourceMap: false })],
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
                typescript({
                    exclude: '**/*.test.ts',
                    declaration: true,
                    declarationMap: true,
                    emitDeclarationOnly: true,
                    rootDir: 'src',
                    declarationDir: 'dist/types',
                    sourceMap: true,
                }),
            ],
        },
    ];
};

module.exports = main;
