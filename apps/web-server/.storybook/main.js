const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
    stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@storybook/addon-interactions',
        'storybook-addon-next-router',
    ],
    // https://storybook.js.org/docs/react/configure/images-and-assets#serving-static-files-via-storybook-configuration
    staticDirs: ['../public'],
    webpackFinal: async config => {
        // tsconfigのpathsを使うための設定
        // https://stackoverflow.com/questions/71677948/how-to-add-typescript-paths-to-storybook
        config.resolve.plugins = [new TsconfigPathsPlugin()];

        // scssを@importするための設定
        // https://blog.gaji.jp/2021/10/20/8350/
        config.module.rules.push({
            test: /\.scss$/,
            use: [
                'style-loader',
                {
                    loader: 'css-loader',
                    options: {
                        modules: {
                            auto: true,
                        },
                    },
                },
                // 'sass-loader'はStorybookのみで用いられている。そのためStorybookで必要なくなったら yarn remove sass-loader を実行したほうがいい。
                'sass-loader',
            ],
            include: path.resolve(__dirname, '../'),
        });
        return config;
    },
    // これがないと constructor(private readonly param: string) のように引数に修飾子が付いているコードでエラーが出る
    // https://github.com/storybookjs/storybook/issues/13834#issuecomment-880646396
    babel: async options => {
        return {
            ...options,
            plugins: options.plugins.filter(
                x => !(typeof x === 'string' && x.includes('plugin-transform-classes'))
            ),
        };
    },
    framework: '@storybook/react',
    core: {
        builder: '@storybook/builder-webpack5',
    },
};
