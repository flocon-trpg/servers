import Config from '@flocon-trpg/eslint-config';
import ReactConfig from 'eslint-plugin-react'
import ReactHooksConfig from 'eslint-plugin-react-hooks'

export default [...Config,
  ReactConfig.configs.flat.recommended,
  ReactConfig.configs.flat['jsx-runtime'],
{
        plugins: {
            "react-hooks": ReactHooksConfig,
        },
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
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        projectService: true,
        // import.meta.dirname は ESM かつ Node.js >=20.11.0 / >= 21.2.0 でなければ使えない。
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]