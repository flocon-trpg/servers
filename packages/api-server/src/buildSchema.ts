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
import { registerEnumTypes } from './graphql+mikro-orm/registerEnumTypes';
import { RoomResolver } from './graphql+mikro-orm/resolvers/rooms/RoomResolver';
import { MainResolver } from './graphql+mikro-orm/resolvers/MainResolver';
import { PubSubOptions } from 'graphql-subscriptions';
import { ResolverContext } from './graphql+mikro-orm/utils/Contexts';
import {
    checkSignIn,
    getUserIfEntry,
    NotSignIn,
} from './graphql+mikro-orm/resolvers/utils/helpers';
import { BaasType } from './enums/BaasType';
import { ADMIN, ENTRY } from './roles';
import { ServerConfig } from './configType';

export const noAuthCheck = 'noAuthCheck';

const authChecker =
    (serverConfig: ServerConfig | typeof noAuthCheck): AuthChecker<ResolverContext> =>
    async ({ context }, roles) => {
        if (serverConfig === noAuthCheck) {
            throw new Error('authChecker is disbled');
        }

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

        const adminConfig = serverConfig.admins;
        let adminUserUids: string[];
        if (typeof adminConfig === 'string') {
            adminUserUids = [adminConfig];
        } else if (adminConfig == null) {
            adminUserUids = [];
        } else {
            adminUserUids = adminConfig;
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
            serverConfig,
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
    path: path.resolve(process.cwd(), './tmp/schema.gql'),
    commentDescriptions: true,
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
