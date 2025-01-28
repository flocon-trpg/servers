import { Test, TestingModule } from '@nestjs/testing';
import { ServerConfig, ServerConfigService } from '../server-config/server-config.service';
import { ServerConfigServiceStub } from '../server-config/server-config.service.stub';
import { InitializeFirebaseService } from './initialize-firebase.service';

describe('InitializeFirebaseService', () => {
    const setup = async (serverConfig: ServerConfig) => {
        const serverConfigServiceStub = new ServerConfigServiceStub({ serverConfig });
        const module: TestingModule = await Test.createTestingModule({
            providers: [ServerConfigService, InitializeFirebaseService],
        })
            .overrideProvider(ServerConfigService)
            .useValue(serverConfigServiceStub)
            .compile();

        return module.get(InitializeFirebaseService);
    };

    it('should be defined', async () => {
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
        const service = await setup(serverConfig);
        expect(service).toBeDefined();
    });
});
