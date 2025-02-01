// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import { flatConfigs } from 'eslint-plugin-import';

export default [
    ...tseslint.config(
        eslint.configs.recommended,
        ...tseslint.configs.recommendedTypeChecked,
        flatConfigs.recommended,
        // { ignores: ['**/*.d.ts', '.eslintrc.js'] },
        { ignores: ['**/*.d.ts'] },
        {
            // https://typescript-eslint.io/troubleshooting/typed-linting/performance/#eslint-plugin-import
            rules: {
                'import/named': 'off',
                'import/namespace': 'off',
                'import/default': 'off',
                'import/no-named-as-default-member': 'off',
                'import/no-unresolved': 'off',
            },
        },
        {
            rules: {
                '@typescript-eslint/member-delimiter-style': ['error'],
                '@typescript-eslint/explicit-module-boundary-types': 'off',
                '@typescript-eslint/no-namespace': 'off',
                '@typescript-eslint/no-non-null-assertion': 'off',
                '@typescript-eslint/no-explicit-any': 'off',
                '@typescript-eslint/switch-exhaustiveness-check': [
                    'error',
                    { considerDefaultExhaustiveForUnions: true },
                ],
                '@typescript-eslint/no-unused-vars': 'off', // 誤検知が多いため off にしている
                '@typescript-eslint/require-await': 'off',
                '@typescript-eslint/no-unused-expressions': [
                    'warn',
                    { allowTernary: true, allowShortCircuit: true },
                ],
                eqeqeq: ['warn', 'smart'],
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
                'no-console': 'warn',
            },
        },
    ),
    eslintConfigPrettier,
];
