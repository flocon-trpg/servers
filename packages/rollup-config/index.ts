import typescript from '@rollup/plugin-typescript';
import { ExternalOption, OutputOptions, RollupOptions } from 'rollup';

/** 
 * @example
 * ```javascript
const { config } = require('@flocon-trpg/rollup-config');
// https://rollupjs.org/guide/en/#importing-packagejson
const external = Object.keys(require('./package.json').dependencies ?? { });
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
            interop: 'auto',
            sourcemap: true,
        },
        external,
        plugins: [
            typescript({
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
