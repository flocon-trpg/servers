module.exports = {
    extends: ['@flocon-trpg/eslint-config'],
    parserOptions: {
        project: './tsconfig.json',
        // vscodeのeslintが正常に動くようにtsconfigRootDirを設定している
        tsconfigRootDir: __dirname,
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
        'react/prop-types': 'off',
    },
};
