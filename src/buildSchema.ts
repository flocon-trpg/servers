import { buildSchema as buildSchemaCore, BuildSchemaOptions, buildSchemaSync as buildSchemaSyncCore, PrintSchemaOptions } from 'type-graphql';
import path from 'path';
import { GraphQLSchema } from 'graphql';
import registerEnumTypes from './graphql+typegoose/registerEnumTypes';
import { RoomResolver } from './graphql+typegoose/resolvers/rooms/RoomResolver';
import { MainResolver } from './graphql+typegoose/resolvers/MainResolver';
import { RoomMessageResolver } from './graphql+typegoose/resolvers/rooms/RoomMessageResolver';

type Options = {
    emitSchemaFile: boolean;
}

// EmitSchemaFileOptionsがtype-graphqlからexportされていないので再定義している。
interface EmitSchemaFileOptions extends Partial<PrintSchemaOptions> {
    path?: string;
}

const resolvers = [RoomResolver, MainResolver, RoomMessageResolver] as const;
const optionBase: BuildSchemaOptions = {
    resolvers,
};

const emitSchemaFileOptions: EmitSchemaFileOptions = ({
    path: path.resolve(process.cwd(), '../graphql/generated/schema.gql'),
    commentDescriptions: true
});

export const buildSchema = async (options: Options): Promise<GraphQLSchema> => {
    registerEnumTypes();
    let emitSchemaFile: EmitSchemaFileOptions | undefined = undefined;
    if (options.emitSchemaFile) {
        emitSchemaFile = emitSchemaFileOptions;
    }
    return await buildSchemaCore({
        ...optionBase,
        emitSchemaFile,
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
