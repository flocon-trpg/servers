import { join } from 'path';
import { loggerRef } from '@flocon-trpg/utils';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { DynamicModule, Module, ModuleMetadata, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ServeStaticModule } from '@nestjs/serve-static';
import { Kind, parse } from 'graphql';
import { NextMessage } from 'graphql-ws';
import { ApiUploaderController } from './api-uploader/api-uploader.controller';
import { AuthGuard } from './auth/auth.guard';
import { createConfigModule } from './config/createConfigModule';
import { ConnectionManagerService } from './connection-manager/connection-manager.service';
import { FirebaseIdTokenService } from './firebase-id-token/firebase-id-token.service';
import { registerEnumTypes } from './graphql/registerEnumTypes';
import { allResolvers } from './graphql/resolvers/allResolvers';
import { IndexErrorController } from './index-error/index-error.controller';
import { IndexOkController } from './index-ok/index-ok.controller';
import { InitializeFirebaseService } from './initialize-firebase/initialize-firebase.service';
import { MigrationService } from './migration/migration.service';
import { MikroOrmService } from './mikro-orm/mikro-orm.service';
import { PubSubService } from './pub-sub/pub-sub.service';
import { ServerConfigService } from './server-config/server-config.service';
import { SetupServerService } from './setup-server/setup-server.service';
import { YargsService } from './yargs/yargs.service';

registerEnumTypes();

const isRoomEventSubscription = (query: string) => {
    const parsedQuery = parse(query);
    return parsedQuery.definitions.some(t => {
        if (t.kind !== Kind.OPERATION_DEFINITION) {
            return false;
        }
        return t.name?.value.toLowerCase() === 'roomevent';
    });
};

type GlobalModuleOptions = {
    overrideConfigModuleOptions?: ConfigModuleOptions;
};

// GraphQLModule.forRootAsync の inject は、Module を import しないと使えないようなので、inject できるようにこの Module を分離している。せっかくなのでベースとなる service も全てここに書いている。
@Module({})
export class GlobalModule {
    static async forRoot(options: GlobalModuleOptions): Promise<DynamicModule> {
        return {
            module: GlobalModule,
            imports: [
                options.overrideConfigModuleOptions
                    ? await ConfigModule.forRoot(options.overrideConfigModuleOptions)
                    : await createConfigModule(),
            ],
            providers: [
                PubSubService,
                MikroOrmService,
                YargsService,
                ServerConfigService,
                FirebaseIdTokenService,
                { provide: APP_GUARD, useClass: AuthGuard },
                // NestJs の app は本番用とテスト用の2種類あるため、もし useGlobalPipe を使って ValidationPipe を登録する方法を使うと片方で useGlobalPipe を書き忘れるミスをする可能性がある。そのため代わりにここで登録している
                { provide: APP_PIPE, useClass: ValidationPipe },
                ConnectionManagerService,
                MigrationService,
                InitializeFirebaseService,
            ],
            exports: [
                PubSubService,
                MikroOrmService,
                YargsService,
                ServerConfigService,
                FirebaseIdTokenService,
                ConnectionManagerService,
                MigrationService,
                InitializeFirebaseService,
            ],
        };
    }
}

type AppModuleMetadataOptions = {
    enableWebServer: boolean;
    suppressGraphQLLog: boolean;
};

const createAppModuleMetadata = ({
    enableWebServer,
    suppressGraphQLLog,
    overrideConfigModuleOptions,
}: AppModuleMetadataOptions & GlobalModuleOptions): ModuleMetadata => {
    const globalModule = GlobalModule.forRoot({ overrideConfigModuleOptions });
    const imports: ModuleMetadata['imports'] = [
        globalModule,
        GraphQLModule.forRootAsync<ApolloDriverConfig>({
            driver: ApolloDriver,
            imports: [globalModule],
            inject: [FirebaseIdTokenService, ConnectionManagerService],
            useFactory: async (
                idTokenService: FirebaseIdTokenService,
                connectionManagerService: ConnectionManagerService,
            ) => {
                return {
                    autoSchemaFile: join(process.cwd(), './schema.gql'),
                    sortSchema: true,
                    subscriptions: {
                        'graphql-ws': {
                            onSubscribe: async (ctx, message) => {
                                if (!suppressGraphQLLog) {
                                    loggerRef.info({ message }, 'graphql-ws onSubscribe');
                                }

                                // Apollo Clientなどではmessage.payload.operationNameが使えるがurqlではnullishなので、queryを代わりに使っている
                                if (!isRoomEventSubscription(message.payload.query)) {
                                    return;
                                }
                                const decodedIdToken =
                                    await idTokenService.getDecodedIdTokenFromWsContext(ctx);
                                if (decodedIdToken?.isError !== false) {
                                    return;
                                }

                                const roomId = message.payload.variables?.id;
                                if (typeof roomId === 'string') {
                                    await connectionManagerService.value.onConnectToRoom({
                                        connectionId: message.id,
                                        userUid: decodedIdToken.value.uid,
                                        roomId,
                                    });
                                } else {
                                    if (!suppressGraphQLLog) {
                                        loggerRef.warn('(typeof RoomEvent.id) should be string');
                                    }
                                }
                            },
                            onNext(ctx, message, args, result) {
                                loggerRef.info({ message, result }, 'graphql-ws onNext');
                            },
                            // CONSIDER: graphql-ws には onComplete メソッドは存在するが、nestjs の型には存在しないため、正常に動作する保証がない
                            onComplete: (_ctx: unknown, message: NextMessage) => {
                                // onComplete メソッドが正常に動作する保証がないため一応nullチェックだけは行っている
                                if (message == null) {
                                    return;
                                }
                                if (!suppressGraphQLLog) {
                                    loggerRef.info({ message }, 'graphql-ws onComplete');
                                }
                                return connectionManagerService.value.onLeaveRoom({
                                    connectionId: message.id,
                                });
                            },
                            onClose: async (ctx, code, reason) => {
                                if (!suppressGraphQLLog) {
                                    loggerRef.info({ code, reason }, 'graphql-ws onClose');
                                }
                                for (const key in ctx.subscriptions) {
                                    await connectionManagerService.value.onLeaveRoom({
                                        connectionId: key,
                                    });
                                }
                            },
                        },
                    },
                };
            },
        }),
    ];
    if (enableWebServer) {
        imports.push(
            ServeStaticModule.forRoot({
                rootPath: join(__dirname, '..', '..', 'web-server', 'dist.api-server'),
                renderPath: /^(?!(graphql|uploader)\/)/gim,
            }),
        );
    }

    const controllers: ModuleMetadata['controllers'] = [ApiUploaderController];
    if (!enableWebServer) {
        controllers.push(IndexOkController);
    }
    return {
        imports,
        controllers,
        providers: [...allResolvers, SetupServerService],
    };
};

type AppModuleMetadataOptionsForTest = {
    enableWebServer: boolean;
} & GlobalModuleOptions;

export const createAppModuleMetadataForTest = ({
    enableWebServer,
    overrideConfigModuleOptions,
}: AppModuleMetadataOptionsForTest): ModuleMetadata =>
    createAppModuleMetadata({
        enableWebServer,
        overrideConfigModuleOptions,
        suppressGraphQLLog: true,
    });

@Module(createAppModuleMetadata({ enableWebServer: false, suppressGraphQLLog: false }))
export class AppModule {}

@Module(createAppModuleMetadata({ enableWebServer: true, suppressGraphQLLog: false }))
export class AppWithWebServerModule {}

@Module({
    controllers: [IndexErrorController],
})
export class AppAsErrorModule {}
