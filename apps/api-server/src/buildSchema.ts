import path from 'path';
import { GraphQLSchema } from 'graphql';
import { PubSubOptions } from 'graphql-subscriptions';
import {
    AuthChecker,
    BuildSchemaOptions,
    PrintSchemaOptions,
    PubSubEngine,
    buildSchema as buildSchemaCore,
    buildSchemaSync as buildSchemaSyncCore,
} from 'type-graphql';
import { ServerConfig } from './config/types';
import { registerEnumTypes } from './graphql/registerEnumTypes';
import { allResolvers } from './graphql/resolvers/allResolvers';
import { NotSignIn } from './graphql/resolvers/utils/utils';
import { ResolverContext } from './types';
import { getRolesAndCheckEntry } from './utils/roles';

export const noAuthCheck = 'noAuthCheck';

const authChecker =
    (serverConfig: ServerConfig | typeof noAuthCheck): AuthChecker<ResolverContext> =>
    async ({ context }, roles) => {
        if (serverConfig === noAuthCheck) {
            throw new Error('authChecker is disbled');
        }

        const myRoles = await getRolesAndCheckEntry({
            context,
            serverConfig,
            setAuthorizedUserToResolverContext: true,
        });
        if (myRoles === NotSignIn) {
            return false;
        }

        return myRoles.isPermitted(roles);
    };

type Options = {
    emitSchemaFile: boolean;
    pubSub?: PubSubEngine | PubSubOptions;
};

// EmitSchemaFileOptionsがtype-graphqlからexportされていないので再定義している。
interface EmitSchemaFileOptions extends Partial<PrintSchemaOptions> {
    path?: string;
}

const optionBase: BuildSchemaOptions = {
    resolvers: allResolvers,
};

const emitSchemaFileOptions: EmitSchemaFileOptions = {
    path: path.resolve(process.cwd(), './tmp/schema.gql'),
};

// class-validator@0.14.0 で forbidUnknownValues がデフォルトで true になったため、false を設定するようにする処理。
// https://github.com/typestack/class-validator/blob/develop/CHANGELOG.md#0140-2022-12-09
const validate: BuildSchemaOptions['validate'] = { forbidUnknownValues: false };

export const buildSchema =
    (serverConfig: ServerConfig | typeof noAuthCheck) =>
    async (options: Options): Promise<GraphQLSchema> => {
        registerEnumTypes();
        let emitSchemaFile: EmitSchemaFileOptions | undefined = undefined;
        if (options.emitSchemaFile) {
            emitSchemaFile = emitSchemaFileOptions;
        }
        return await buildSchemaCore({
            ...optionBase,
            authChecker: authChecker(serverConfig),
            emitSchemaFile,
            pubSub: options.pubSub,
            validate,
        });
    };

export const buildSchemaSync =
    (serverConfig: ServerConfig | typeof noAuthCheck) =>
    (options: Options): GraphQLSchema => {
        registerEnumTypes();
        let emitSchemaFile: EmitSchemaFileOptions | undefined = undefined;
        if (options.emitSchemaFile) {
            emitSchemaFile = emitSchemaFileOptions;
        }
        return buildSchemaSyncCore({
            ...optionBase,
            authChecker: authChecker(serverConfig),
            emitSchemaFile,
            pubSub: options.pubSub,
            validate,
        });
    };
