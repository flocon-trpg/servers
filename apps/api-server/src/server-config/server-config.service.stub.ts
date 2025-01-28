import { Result } from '@kizahasi/result';
import {
    ServerConfig,
    ServerConfigForMigration,
    ServerConfigService,
} from './server-config.service';

export class ServerConfigServiceStub
    implements
        Pick<
            ServerConfigService,
            'getValue' | 'getValueForce' | 'getValueForMigration' | 'getValueForMigrationForce'
        >
{
    public serverConfig: ServerConfig;
    public serverConfigForMigration: ServerConfigForMigration | undefined;

    public constructor({
        serverConfig,
        serverConfigForMigration,
    }: {
        serverConfig: ServerConfig;
        serverConfigForMigration?: ServerConfigForMigration;
    }) {
        this.serverConfig = serverConfig;
        this.serverConfigForMigration = serverConfigForMigration;
    }

    public getValue(): Result<ServerConfig> {
        return Result.ok(this.serverConfig);
    }
    public getValueForce(): ServerConfig {
        return this.serverConfig;
    }
    public getValueForMigration(): Result<ServerConfigForMigration> {
        return Result.ok(this.serverConfigForMigration ?? this.serverConfig);
    }
    public getValueForMigrationForce(): ServerConfigForMigration {
        return this.serverConfigForMigration ?? this.serverConfig;
    }
}
