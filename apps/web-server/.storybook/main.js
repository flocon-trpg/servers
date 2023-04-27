module.exports = {
    stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@storybook/addon-interactions',
        '@storybook/addon-mdx-gfm',
    ],
    // https://storybook.js.org/docs/react/configure/images-and-assets#serving-static-files-via-storybook-configuration
    staticDirs: ['../public'],
    webpackFinal: async config => {
        // ModuleNotFoundError: Module not found: Error: Can't resolve 'stream' in '(dir)\server\node_modules\pino-abstract-transport\node_modules\split2' (おそらく pino で transport を指定しているのが原因)に対する対処
        config.resolve.fallback.stream = false;
        return config;
    },
    babel: async options => {
        // HACK: babelModeV7 を true にすると .babelrc.json ファイルなどを読み込んでくれるはずだが何故か読み込んでくれないため、仕方なくここに直書きしている。
        return {
            ...options,
            presets: [
                [
                    '@babel/preset-env',
                    {
                        targets: {
                            chrome: 100,
                        },
                    },
                ],
                '@babel/preset-typescript',
                [
                    '@babel/preset-react',
                    {
                        runtime: 'automatic',
                    },
                ],
            ],
        };
    },
    framework: {
        name: '@storybook/nextjs',
        options: {},
    },
    features: {
        babelModeV7: true,
    },
    docs: {
        autodocs: true,
    },
};
