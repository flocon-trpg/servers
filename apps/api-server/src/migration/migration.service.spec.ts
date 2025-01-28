import { Test, TestingModule } from '@nestjs/testing';
import { MikroOrmService } from '../mikro-orm/mikro-orm.service';
import { ServerConfig, ServerConfigService } from '../server-config/server-config.service';
import { ServerConfigServiceStub } from '../server-config/server-config.service.stub';
import { YargsService } from '../yargs/yargs.service';
import { YargsServiceStub } from '../yargs/yargs.service.stub';
import { MigrationService } from './migration.service';

describe('MigrationService', () => {
    let service: MigrationService;

    beforeEach(async () => {
        const serverConfig: ServerConfig = {
            admins: [],
            entryPassword: undefined,
            firebaseAdminSecret: undefined,
            firebaseProjectId: undefined,
            uploader: undefined,
            autoMigration: false,
            accessControlAllowOrigin: undefined,
            roomHistCount: undefined,
            disableRateLimitExperimental: false,
            heroku: false,
            databaseUrl: undefined,
            mysql: undefined,
            postgresql: undefined,
            sqlite: undefined,
        };
        const serverConfigServiceStub = new ServerConfigServiceStub({ serverConfig });
        const yargsServiceStub = new YargsServiceStub({ main: { db: null, debug: false } });
        const module: TestingModule = await Test.createTestingModule({
            providers: [MigrationService, YargsService, MikroOrmService, ServerConfigService],
        })
            .overrideProvider(YargsService)
            .useValue(yargsServiceStub)
            .overrideProvider(ServerConfigService)
            .useValue(serverConfigServiceStub)
            .compile();

        service = module.get(MigrationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
