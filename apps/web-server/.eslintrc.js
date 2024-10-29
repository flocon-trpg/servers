module.exports = {
    env: {
        browser: true,
        es6: true,
    },
    settings: {
        react: { version: 'detect' },
    },
    extends: ['@flocon-trpg/eslint-config-v8', 'plugin:@next/next/recommended'],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
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
    plugins: ['@typescript-eslint', 'react', 'react-hooks'],
    rules: {
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': [
            'error',
            {
                additionalHooks: '^use((Memo|Callback)One|DeepCompareEffect)$',
            },
        ],
        '@typescript-eslint/switch-exhaustiveness-check': 'error',
        'react/prop-types': 'off',
        '@next/next/no-img-element': 'off',
    },
};
