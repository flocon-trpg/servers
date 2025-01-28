import Config from '@flocon-trpg/eslint-config';

export default [...Config,
{
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        projectService: true,
        // import.meta.dirname は ESM かつ Node.js >=20.11.0 / >= 21.2.0 でなければ使えない。
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
                '@typescript-eslint/no-unused-vars': 'off', // 誤検知が多いため off にしている
    }
  },
]