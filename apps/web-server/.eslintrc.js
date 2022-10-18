module.exports = {
    env: {
        browser: true,
        es6: true,
    },
    ignorePatterns: ['.eslintrc.js'],
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
        // vscodeのeslintが正常に動くようにtsconfigRootDirを設定している
        tsconfigRootDir: __dirname,
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
                additionalHooks: '^use((Memo|Callback)One|DeepCompareEffect)$',
            },
        ],
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/switch-exhaustiveness-check': 'error',
        'space-before-blocks': 'warn',
        'react/prop-types': 'off',
        '@next/next/no-img-element': 'off',
    },
};
