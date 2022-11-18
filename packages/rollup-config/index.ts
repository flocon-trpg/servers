import typescript from '@rollup/plugin-typescript';
import { ExternalOption, OutputOptions, RollupOptions } from 'rollup';

/** 
 * @example
 * ```javascript
const { config } = require('@flocon-trpg/rollup-config');
// https://rollupjs.org/guide/en/#importing-packagejson
const external = Object.keys(require('./package.json').dependencies);
module.exports = config({ external });
 * ```
 */
export function config({ external }: { external: ExternalOption }): RollupOptions[] {
    const input = 'src/index.ts';

    const config = ({ dir, format }: Pick<OutputOptions, 'dir' | 'format'>): RollupOptions => ({
        input,
        output: {
            dir,
            format,
            sourcemap: false,
            interop: 'auto',
        },
        external,
        plugins: [typescript({ compilerOptions: { sourceMap: false } })],
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
