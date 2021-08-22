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
import {
    checkSignIn,
    getUserIfEntry,
    NotSignIn,
} from './graphql+mikro-orm/resolvers/utils/helpers';
import { loadServerConfigAsMain } from './config';
import { BaasType } from './enums/BaasType';
import { ADMIN, ENTRY } from './roles';

const authChecker: AuthChecker<ResolverContext> = async ({ context }, roles) => {
    let role: typeof ADMIN | typeof ENTRY | null = null;
    if (roles.includes(ADMIN)) {
        role = ADMIN;
    } else if (roles.includes(ENTRY)) {
        role = ENTRY;
    }

    const decodedIdToken = checkSignIn(context);
    if (decodedIdToken === NotSignIn) {
        return false;
    }

    if (role == null) {
        return true;
    }

    const serverConfig = await loadServerConfigAsMain();
    let adminUserUids: string[];
    if (typeof serverConfig.admin === 'string') {
        adminUserUids = [serverConfig.admin];
    } else if (serverConfig.admin == null) {
        adminUserUids = [];
    } else {
        adminUserUids = serverConfig.admin;
    }

    if (role === ADMIN) {
        if (!adminUserUids.includes(decodedIdToken.uid)) {
            return false;
        }
    }

    const user = await getUserIfEntry({
        em: context.em,
        userUid: decodedIdToken.uid,
        baasType: BaasType.Firebase,
    });
    if (user == null) {
        return false;
    }
    context.authorizedUser = user;
    return true;
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
        authChecker,
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
        authChecker,
        emitSchemaFile,
        pubSub: options.pubSub,
    });
};
