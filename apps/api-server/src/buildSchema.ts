import {
    AuthChecker,
    BuildSchemaOptions,
    PrintSchemaOptions,
    PubSubEngine,
    buildSchema as buildSchemaCore,
    buildSchemaSync as buildSchemaSyncCore,
} from 'type-graphql';
import path from 'path';
import { GraphQLSchema } from 'graphql';
import { registerEnumTypes } from './graphql+mikro-orm/registerEnumTypes';
import { RoomResolver } from './graphql+mikro-orm/resolvers/rooms/RoomResolver';
import { MainResolver } from './graphql+mikro-orm/resolvers/MainResolver';
import { PubSubOptions } from 'graphql-subscriptions';
import { ResolverContext } from './graphql+mikro-orm/utils/Contexts';
import { NotSignIn } from './graphql+mikro-orm/resolvers/utils/helpers';
import { getRolesAndCheckEntry } from './roles';
import { ServerConfig } from './config/types';

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

const resolvers = [RoomResolver, MainResolver] as const;
const optionBase: BuildSchemaOptions = {
    resolvers,
};

const emitSchemaFileOptions: EmitSchemaFileOptions = {
    path: path.resolve(process.cwd(), './tmp/schema.gql'),
};

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
        });
    };
