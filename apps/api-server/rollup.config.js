const typescript = require('@rollup/plugin-typescript');
const multiInput = require('rollup-plugin-multi-input');
const json = require('@rollup/plugin-json');

const external = [
    // https://rollupjs.org/guide/en/#importing-packagejson
    ...Object.keys(require('./package.json').dependencies),
    // preserveModules=true かつ decorator が有効の場合、この 'tslib' がないとコードが想定通りの形で出力されない。
    'tslib',
    'path',
    'http',
    'fs',
    'fs/promises',
];

module.exports = [
    {
        input: ['src/index.ts', 'src/run-*.ts', 'src/__migrations__/**/*.ts'],
        output: {
            dir: 'dist',
            format: 'cjs',
            sourcemap: true,
            // mikro-ormのmigrationでJavaScriptファイルを参照しているため、これらを正常に動作させるためにtrueにしている。
            preserveModules: true,
        },
        plugins: [
            multiInput.default(),
            typescript({
                declaration: false,
                declarationMap: false,
                sourceMap: true,
            }),
            json(),
        ],
        external,
    },
];
