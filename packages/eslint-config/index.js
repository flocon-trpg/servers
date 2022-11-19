module.exports = {
    root: true,
    ignorePatterns: ['**/*.d.ts', '.eslintrc.js'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'import'],
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
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/switch-exhaustiveness-check': 'error',
        '@typescript-eslint/no-throw-literal': 'error',
        'prefer-promise-reject-errors': 'error',
        'space-before-blocks': 'warn',
        'sort-imports': [
            'error',
            {
                // sort-importsはimportしたmemberのsortに利用している。
                // declarationのsortはauto-fixできないため、その部分は代わりにimport/orderを使っている。 https://github.com/eslint/eslint/issues/11542#issuecomment-498215828
                ignoreDeclarationSort: true,
            },
        ],
        'import/order': [
            'error',
            {
                alphabetize: {
                    order: 'asc',
                },
            },
        ],
    },
};
