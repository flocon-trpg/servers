const typescript = require('@rollup/plugin-typescript');

const input = 'src/index.ts';
// https://rollupjs.org/guide/en/#importing-packagejson
const external = Object.keys(require('./package.json').dependencies);

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

module.exports = [
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
