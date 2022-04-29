module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
    ],
    rules: {
        '@typescript-eslint/member-delimiter-style': ['error'],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-namespace': 'off',
        'space-before-blocks': 'warn',
        'sort-imports': [
            'error',
            {
                /*
                https://github.com/eslint/eslint/issues/11542 によると、declarationの順序の変更は副作用の可能性がある。
                また、declartionの順序をauto-fixするには他のプラグインを用いる必要があり、一手間かかる。
                そのため、ignoreDeclarationDortはtrueにしている。
                */
                ignoreDeclarationSort: true,
            },
        ],
    },
};
