// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier'

export default [...tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  { ignores: ['**/*.d.ts'] },
  {
    rules: {
        '@typescript-eslint/member-delimiter-style': ['error'],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/switch-exhaustiveness-check': 'error',
        '@typescript-eslint/no-unused-vars': 'off', // 誤検知が多いため off にしている
        '@typescript-eslint/require-await': 'off',
        "eqeqeq": ['warn', 'smart' ],
        'prefer-promise-reject-errors': 'error',
        'space-before-blocks': 'warn',
        'sort-imports': [
            'error',
            {
                // memberのsortだけ行っている。
                // declarationのsortは、sort-importsだとファイル名ではなくメンバー名でsortするのが微妙に感じたので当初はeslint-plugin-importを使っていたが、eslint v9かつflat configを使いeslint-import-resolver-typescriptなしでlintを実行した際にエラーが発生した。eslint-import-resolver-typescriptをflat configで使う方法（もしくはeslint-import-resolver-typescriptの必要性）も調べた感じではわからなかった。他のlintプラグインやprettierプラグインを使うことも検討したが、リソースを削ってまでdeclarationのソートを行う必要性があるかというと疑問に感じたため、declarationのsortはとりあえず現時点では無効にしている。
                ignoreDeclarationSort: true,
            },
        ],
        'no-console': 'warn',
    },
  }
), eslintConfigPrettier];