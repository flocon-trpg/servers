module.exports = {
    root: true,
    env: {
        node: true,
        es6: true,
    },
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    rules: {
        '@typescript-eslint/member-delimiter-style': ['error'],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-namespace': 'off',
        'space-before-blocks': 'warn',
    },
};
