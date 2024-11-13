module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'scope-enum': [
            2,
            'always',
            [
                'deps',
                'docker',
                'api-server',
                'web-server',
                'cache',
                'core',
                'docs',
                'eslint-config',
                'flocon-script',
                'prettier-config',
                'rollup-config',
                'sdk',
                'sdk-react',
                'sdk-urql',
                'utils',
                'web-server-utils',
            ],
        ],
        'subject-case': [0],
    },
};
