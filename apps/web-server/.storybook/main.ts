/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import path, { dirname, join } from 'path';
import type { StorybookConfig } from '@storybook/react-vite';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
    return dirname(require.resolve(join(value, 'package.json')));
}
const config: StorybookConfig = {
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
    addons: [
        getAbsolutePath('@storybook/addon-onboarding'),
        getAbsolutePath('@storybook/addon-links'),
        getAbsolutePath('@storybook/addon-essentials'),
        getAbsolutePath('@chromatic-com/storybook'),
        getAbsolutePath('@storybook/addon-interactions'),
    ],
    framework: {
        name: getAbsolutePath('@storybook/react-vite'),
        options: {},
    },
    typescript: {
        /*
    reactDocgen を有効化すると下のエラーが出て storybook を利用できないため、無効化している。
    TODO: reactDocgen を有効化する

    Internal server error: Argument must be Identifier, Literal, QualifiedTypeIdentifier or TSQualifiedName. Received 'PrivateName'
    Plugin: storybook:react-docgen-plugin
    */
        reactDocgen: false,
    },
    // @ts-expect-error - webpackFinal is not defined in the StorybookConfig type

    webpackFinal: async (config: any) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            '@': path.resolve(__dirname, '../src'),
        };

        return config;
    },
};
export default config;
