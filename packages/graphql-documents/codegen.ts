import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    schema: '../../apps/api-server/schema.gql',
    documents: ['src/**/*.ts'],
    ignoreNoDocuments: true,
    generates: {
        './src/graphql-codegen/': {
            preset: 'client',
            config: {
                useTypeImports: true,
                // Flocon は monorepo であるため、もし false にすると複数の enum が混在するので enumsAsConst を true にしている。
                enumsAsConst: true,
            },
            presetConfig: {
                fragmentMasking: false,
            },
        },
    },
    hooks: {
        afterAllFileWrite: ['prettier --write'],
    },
};

export default config;
