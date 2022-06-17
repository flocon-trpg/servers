module.exports = {
    env: {
        browser: true,
        es6: true,
    },
    settings: {
        react: { version: 'detect' },
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:@next/next/recommended',
        'prettier',
    ],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    ignorePatterns: ['**/floconLibSource.d.ts'],
    plugins: ['@typescript-eslint', 'react', 'react-hooks'],
    rules: {
        '@typescript-eslint/member-delimiter-style': ['error'],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': [
            'error',
            {
                additionalHooks: '^usePersistentMemo$',
            },
        ],
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'space-before-blocks': 'warn',
        'react/prop-types': 'off',
        '@next/next/no-img-element': 'off',
        // monorepoのルートでlintを実行する場合、下のようにパスを設定しないと「Pages directory cannot be found at D:\Users\Owner\Documents\repos\@flocon-trpg\server\pages or D:\Users\Owner\Documents\repos\@flocon-trpg\server\src\pages. If using a custom path, please configure with the no-html-link-for-pages rule in your eslint config file」というエラーが出る
        '@next/next/no-html-link-for-pages': ['warn', 'apps/web-server/src/pages'],
    },
};
