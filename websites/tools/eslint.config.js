import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import Config from '@flocon-trpg/eslint-config';

export default tseslint.config({
    extends: [...Config],
    files: ['**/*.{ts,tsx}'],
    ignores: ['dist', '**/*.d.ts'],
    languageOptions: {
        ecmaVersion: 2020,
        globals: globals.browser,
        // other options...
        parserOptions: {
            project: ['./tsconfig.node.json', './tsconfig.app.json'],
            tsconfigRootDir: import.meta.dirname,
        },
    },
    plugins: {
        'react-hooks': reactHooks,
        'react-refresh': reactRefresh,
    },
    rules: {
        ...reactHooks.configs.recommended.rules,
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

        // TODO: Flocon の eslint パッケージと eslint のバージョンが異なるため暫定的に独立した rule を書いているが、パッケージを利用する
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
    },
});
