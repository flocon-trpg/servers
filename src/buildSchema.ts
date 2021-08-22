import {
    AuthChecker,
    buildSchema as buildSchemaCore,
    BuildSchemaOptions,
    buildSchemaSync as buildSchemaSyncCore,
    PrintSchemaOptions,
    PubSubEngine,
} from 'type-graphql';
import path from 'path';
import { GraphQLSchema } from 'graphql';
import registerEnumTypes from './graphql+mikro-orm/registerEnumTypes';
import { RoomResolver } from './graphql+mikro-orm/resolvers/rooms/RoomResolver';
import { MainResolver } from './graphql+mikro-orm/resolvers/MainResolver';
import { PubSubOptions } from 'graphql-subscriptions';
import { ResolverContext } from './graphql+mikro-orm/utils/Contexts';

export const customAuthChecker: AuthChecker<ResolverContext> = ({ context }, roles) => {
    // here we can read the user from context
    // and check his permission in the db against the `roles` argument
    // that comes from the `@Authorized` decorator, eg. ["ADMIN", "MODERATOR"]

    return true; // or false if access is denied
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
    path: path.resolve(process.cwd(), '../graphql/generated/schema.gql'),
    commentDescriptions: true,
};

export const buildSchema = async (options: Options): Promise<GraphQLSchema> => {
    registerEnumTypes();
    let emitSchemaFile: EmitSchemaFileOptions | undefined = undefined;
    if (options.emitSchemaFile) {
        emitSchemaFile = emitSchemaFileOptions;
    }
    return await buildSchemaCore({
        ...optionBase,
        emitSchemaFile,
        pubSub: options.pubSub,
    });
};

export const buildSchemaSync = (options: Options): GraphQLSchema => {
    registerEnumTypes();
    let emitSchemaFile: EmitSchemaFileOptions | undefined = undefined;
    if (options.emitSchemaFile) {
        emitSchemaFile = emitSchemaFileOptions;
    }
    return buildSchemaSyncCore({
        ...optionBase,
        emitSchemaFile,
    });
};
