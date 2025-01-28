import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import {
    ACCESS_CONTROL_ALLOW_ORIGIN,
    AUTO_MIGRATION,
    DATABASE_URL,
    EMBUPLOADER_COUNT_QUOTA,
    EMBUPLOADER_ENABLED,
    EMBUPLOADER_MAX_SIZE,
    EMBUPLOADER_PATH,
    EMBUPLOADER_SIZE_QUOTA,
    ENTRY_PASSWORD,
    FIREBASE_ADMIN_SECRET,
    FIREBASE_PROJECTID,
    FIREBASE_PROJECT_ID,
    FLOCON_ADMIN,
    FLOCON_API_DISABLE_RATE_LIMIT_EXPERIMENTAL,
    HEROKU,
    MYSQL,
    POSTGRESQL,
    ROOMHIST_COUNT,
    SQLITE,
} from '../env';
import {
    ServerConfigService,
    WritableServerConfig,
    WritableServerConfigForMigration,
} from './server-config.service';

const defaultServerConfig: WritableServerConfig = {
    accessControlAllowOrigin: undefined,
    admins: [],
    autoMigration: false,
    databaseUrl: undefined,
    disableRateLimitExperimental: false,
    entryPassword: undefined,
    firebaseAdminSecret: undefined,
    firebaseProjectId: undefined,
    heroku: false,
    mysql: undefined,
    postgresql: undefined,
    roomHistCount: undefined,
    sqlite: undefined,
    uploader: {
        enabled: false,
    },
};

const defaultServerConfigForMigration: WritableServerConfigForMigration = {
    databaseUrl: undefined,
    heroku: false,
    mysql: undefined,
    postgresql: undefined,
    sqlite: undefined,
};

const error = 'error';

type EnvValueCase<T> = {
    stringValue: string;
    expected: T;
};

const booleanlikeValueCases: EnvValueCase<boolean | typeof error>[] = [
    { stringValue: '1', expected: true },
    { stringValue: ' 1 ', expected: true },
    { stringValue: 'true', expected: true },
    { stringValue: 'True', expected: true },
    { stringValue: 'TRUE', expected: true },
    { stringValue: 'yes', expected: true },
    { stringValue: 'on', expected: true },

    { stringValue: '0', expected: false },
    { stringValue: ' 0 ', expected: false },
    { stringValue: 'false', expected: false },
    { stringValue: 'False', expected: false },
    { stringValue: 'FALSE', expected: false },
    { stringValue: 'no', expected: false },
    { stringValue: 'off', expected: false },

    { stringValue: '', expected: error },
    { stringValue: 'invalidvalue', expected: error },
];

const numberValueCases: EnvValueCase<number | typeof error>[] = [
    { stringValue: '0', expected: 0 },
    { stringValue: '1', expected: 1 },
    { stringValue: ' 1 ', expected: 1 },
    { stringValue: '', expected: error },
    { stringValue: 'invalidvalue', expected: error },
];

const setup = async (envMock: Record<string, string>) => {
    const module: TestingModule = await Test.createTestingModule({
        imports: [ConfigModule.forRoot({ envFilePath: [], load: [() => envMock] })],
        providers: [ServerConfigService],
    }).compile();

    return module.get<ServerConfigService>(ServerConfigService);
};

describe('ServerConfigService', () => {
    it('tests empty ServerConfig', async () => {
        const service = await setup({});
        const serverConfig = service.getValueForce();
        expect(serverConfig).toEqual(defaultServerConfig);
        const serverConfigForMigration = service.getValueForMigrationForce();
        expect(serverConfigForMigration).toEqual(defaultServerConfigForMigration);
    });

    it(`tests ${ACCESS_CONTROL_ALLOW_ORIGIN}`, async () => {
        const service = await setup({
            [ACCESS_CONTROL_ALLOW_ORIGIN]: 'https://example.com',
        });
        const serverConfig = service.getValueForce();
        expect(serverConfig).toEqual({
            ...defaultServerConfig,
            accessControlAllowOrigin: 'https://example.com',
        });
        const serverConfigForMigration = service.getValueForMigrationForce();
        expect(serverConfigForMigration).toEqual(defaultServerConfigForMigration);
    });

    it(`tests ${FLOCON_ADMIN} (1 element)`, async () => {
        const service = await setup({
            [FLOCON_ADMIN]: 'abcdef',
        });
        const serverConfig = service.getValueForce();
        expect(serverConfig).toEqual({ ...defaultServerConfig, admins: ['abcdef'] });
        const serverConfigForMigration = service.getValueForMigrationForce();
        expect(serverConfigForMigration).toEqual(defaultServerConfigForMigration);
    });

    it(`tests ${FLOCON_ADMIN} (multiple elements)`, async () => {
        const service = await setup({
            [FLOCON_ADMIN]: 'abcdef,ghijkl',
        });
        const serverConfig = service.getValueForce();
        expect(serverConfig).toEqual({
            ...defaultServerConfig,
            admins: ['abcdef', 'ghijkl'],
        });
        const serverConfigForMigration = service.getValueForMigrationForce();
        expect(serverConfigForMigration).toEqual(defaultServerConfigForMigration);
    });

    it(`tests ${FLOCON_ADMIN} to be error`, async () => {
        const service = await setup({
            [FLOCON_ADMIN]: 'abcdef!',
        });
        const serverConfigResult = service.getValue();
        expect(serverConfigResult.isError).toBe(true);
        const serverConfigForMigration = service.getValueForMigrationForce();
        expect(serverConfigForMigration).toEqual(defaultServerConfigForMigration);
    });

    it.each(booleanlikeValueCases)(`tests ${AUTO_MIGRATION} - %o`, async $case => {
        const service = await setup({
            [AUTO_MIGRATION]: $case.stringValue,
        });
        if ($case.expected === error) {
            const serverConfigResult = service.getValue();
            expect(serverConfigResult.isError).toBe(true);
        } else {
            const serverConfig = service.getValueForce();
            expect(serverConfig).toEqual({ ...defaultServerConfig, autoMigration: $case.expected });
        }
        const serverConfigForMigration = service.getValueForMigrationForce();
        expect(serverConfigForMigration).toEqual(defaultServerConfigForMigration);
    });

    it(`tests ${DATABASE_URL}`, async () => {
        const service = await setup({
            [DATABASE_URL]: 'postgres://postgres:postgres',
        });
        const serverConfig = service.getValueForce();
        expect(serverConfig).toEqual({
            ...defaultServerConfig,
            databaseUrl: 'postgres://postgres:postgres',
        });
        const serverConfigForMigration = service.getValueForMigrationForce();
        expect(serverConfigForMigration).toEqual({
            ...defaultServerConfigForMigration,
            databaseUrl: 'postgres://postgres:postgres',
        });
    });

    it.each(booleanlikeValueCases)(
        `tests ${FLOCON_API_DISABLE_RATE_LIMIT_EXPERIMENTAL} - %o`,
        async $case => {
            const service = await setup({
                [FLOCON_API_DISABLE_RATE_LIMIT_EXPERIMENTAL]: $case.stringValue,
            });
            if ($case.expected === error) {
                const serverConfigResult = service.getValue();
                expect(serverConfigResult.isError).toBe(true);
            } else {
                const serverConfig = service.getValueForce();
                expect(serverConfig).toEqual({
                    ...defaultServerConfig,
                    disableRateLimitExperimental: $case.expected,
                });
            }
            const serverConfigForMigration = service.getValueForMigrationForce();
            expect(serverConfigForMigration).toEqual(defaultServerConfigForMigration);
        },
    );

    it.each([
        {
            stringValue: '{"type": "none"}',
            expected: undefined,
        },
        {
            stringValue: '{"type": "plain", "value": "passw0rd"}',
            expected: { type: 'plain', value: 'passw0rd' },
        },
        {
            stringValue: '{"type": "bcrypt", "value": "passw0rd:hash"}',
            expected: { type: 'bcrypt', value: 'passw0rd:hash' },
        },
    ])(`tests ${ENTRY_PASSWORD} as success - %o`, async $case => {
        const service = await setup({
            [ENTRY_PASSWORD]: $case.stringValue,
        });
        const serverConfig = service.getValueForce();
        expect(serverConfig).toEqual({ ...defaultServerConfig, entryPassword: $case.expected });
        const serverConfigForMigration = service.getValueForMigrationForce();
        expect(serverConfigForMigration).toEqual(defaultServerConfigForMigration);
    });

    it.each([
        {
            stringValue: 'not_json',
        },
        {
            stringValue: '{"type": "none", value: "none_value"}',
        },
        {
            stringValue: '{"type": "plain"}',
        },
        {
            stringValue: '{"value": "passw0rd"}',
        },
    ])(`tests ${ENTRY_PASSWORD} as error - %o`, async $case => {
        const service = await setup({
            [ENTRY_PASSWORD]: $case.stringValue,
        });
        const serverConfigResult = service.getValue();
        expect(serverConfigResult.isError).toBe(true);
        const serverConfigForMigration = service.getValueForMigrationForce();
        expect(serverConfigForMigration).toEqual(defaultServerConfigForMigration);
    });

    it.each([
        {
            stringValue: '{"client_email": "test@example.com", "private_key": "test_private_key"}',
            expected: { client_email: 'test@example.com', private_key: 'test_private_key' },
        },
        {
            stringValue:
                '{"client_email": "test@example.com", "private_key": "test_private_key", "project_id": "test_project_id"}',
            expected: {
                client_email: 'test@example.com',
                private_key: 'test_private_key',
                project_id: 'test_project_id',
            },
        },
    ])(`tests ${FIREBASE_ADMIN_SECRET} as success - %o`, async $case => {
        const service = await setup({
            [FIREBASE_ADMIN_SECRET]: $case.stringValue,
        });
        const serverConfig = service.getValueForce();
        expect(serverConfig).toEqual({
            ...defaultServerConfig,
            firebaseAdminSecret: $case.expected,
        });
        const serverConfigForMigration = service.getValueForMigrationForce();
        expect(serverConfigForMigration).toEqual(defaultServerConfigForMigration);
    });

    it.each([
        {
            stringValue: '{"private_key": "test_private_key"}',
        },
        {
            stringValue: '{"client_email": "test@example.com"}',
        },
        {
            stringValue: '{"project_id": "test_project_id"}',
        },
        {
            stringValue: 'not_json',
        },
    ])(`tests ${FIREBASE_ADMIN_SECRET} as error - %o`, async $case => {
        const service = await setup({
            [FIREBASE_ADMIN_SECRET]: $case.stringValue,
        });
        const serverConfigResult = service.getValue();
        expect(serverConfigResult.isError).toBe(true);
        const serverConfigForMigration = service.getValueForMigrationForce();
        expect(serverConfigForMigration).toEqual(defaultServerConfigForMigration);
    });

    it(`tests ${FIREBASE_PROJECTID}`, async () => {
        const service = await setup({
            [FIREBASE_PROJECTID]: 'test_project_id',
        });
        const serverConfig = service.getValueForce();
        expect(serverConfig).toEqual({
            ...defaultServerConfig,
            firebaseProjectId: 'test_project_id',
        });
        const serverConfigForMigration = service.getValueForMigrationForce();
        expect(serverConfigForMigration).toEqual(defaultServerConfigForMigration);
    });

    it(`tests ${FIREBASE_PROJECT_ID}`, async () => {
        const service = await setup({
            [FIREBASE_PROJECT_ID]: 'test_project_id',
        });
        const serverConfig = service.getValueForce();
        expect(serverConfig).toEqual({
            ...defaultServerConfig,
            firebaseProjectId: 'test_project_id',
        });
        const serverConfigForMigration = service.getValueForMigrationForce();
        expect(serverConfigForMigration).toEqual(defaultServerConfigForMigration);
    });

    it(`should ignore ${FIREBASE_PROJECTID} if ${FIREBASE_PROJECT_ID} is set`, async () => {
        const service = await setup({
            [FIREBASE_PROJECT_ID]: 'test_project_id1',
            [FIREBASE_PROJECTID]: 'test_project_id2',
        });
        const serverConfig = service.getValueForce();
        expect(serverConfig).toEqual({
            ...defaultServerConfig,
            firebaseProjectId: 'test_project_id1',
        });
        const serverConfigForMigration = service.getValueForMigrationForce();
        expect(serverConfigForMigration).toEqual(defaultServerConfigForMigration);
    });

    it.each(booleanlikeValueCases)(`tests ${HEROKU} - %o`, async $case => {
        const service = await setup({
            [HEROKU]: $case.stringValue,
        });
        if ($case.expected === error) {
            const serverConfigResult = service.getValue();
            expect(serverConfigResult.isError).toBe(true);
        } else {
            const serverConfig = service.getValueForce();
            expect(serverConfig).toEqual({ ...defaultServerConfig, heroku: $case.expected });
        }
        if ($case.expected === error) {
            const serverConfigForMigrationResult = service.getValueForMigration();
            expect(serverConfigForMigrationResult.isError).toBe(true);
        } else {
            const serverConfigForMigration = service.getValueForMigrationForce();
            expect(serverConfigForMigration).toEqual({
                ...defaultServerConfigForMigration,
                heroku: $case.expected,
            });
        }
    });

    it.each([
        {
            stringValue: '{"clientUrl": "mysql://mysql:mysql"}',
            expected: { clientUrl: 'mysql://mysql:mysql' },
        },
        {
            stringValue:
                '{"clientUrl": "mysql://mysql:mysql", "driverOptions": {"optKey": "optValue"}}',
            expected: { clientUrl: 'mysql://mysql:mysql', driverOptions: { optKey: 'optValue' } },
        },
    ])(`tests ${MYSQL} as success - %o`, async $case => {
        const service = await setup({
            [MYSQL]: $case.stringValue,
        });

        const serverConfig = service.getValueForce();
        expect(serverConfig).toEqual({ ...defaultServerConfig, mysql: $case.expected });
        const serverConfigForMigration = service.getValueForMigrationForce();
        expect(serverConfigForMigration).toEqual({
            ...defaultServerConfigForMigration,
            mysql: $case.expected,
        });
    });

    it.each([
        {
            stringValue: 'https://invalid.example.com',
        },
        {
            stringValue: '{"invalidKey": "invalid_value"}',
        },
    ])(`tests ${MYSQL} as error - %o`, async $case => {
        const service = await setup({
            [MYSQL]: $case.stringValue,
        });
        const serverConfigResult = service.getValue();
        expect(serverConfigResult.isError).toBe(true);
        const serverConfigForMigrationResult = service.getValueForMigration();
        expect(serverConfigForMigrationResult.isError).toBe(true);
    });

    it.each([
        {
            stringValue: '{"clientUrl": "postgresql://postgresql:postgresql"}',
            expected: { clientUrl: 'postgresql://postgresql:postgresql' },
        },
        {
            stringValue:
                '{"clientUrl": "postgresql://postgresql:postgresql", "driverOptions": {"optKey": "optValue"}}',
            expected: {
                clientUrl: 'postgresql://postgresql:postgresql',
                driverOptions: { optKey: 'optValue' },
            },
        },
    ])(`tests ${POSTGRESQL} as success - %o`, async $case => {
        const service = await setup({
            [POSTGRESQL]: $case.stringValue,
        });

        const serverConfig = service.getValueForce();
        expect(serverConfig).toEqual({ ...defaultServerConfig, postgresql: $case.expected });
        const serverConfigForMigration = service.getValueForMigrationForce();
        expect(serverConfigForMigration).toEqual({
            ...defaultServerConfigForMigration,
            postgresql: $case.expected,
        });
    });

    it.each([
        {
            stringValue: 'https://invalid.example.com',
        },
        {
            stringValue: '{"invalidKey": "invalid_value"}',
        },
    ])(`tests ${POSTGRESQL} as error - %o`, async $case => {
        const service = await setup({
            [POSTGRESQL]: $case.stringValue,
        });
        const serverConfigResult = service.getValue();
        expect(serverConfigResult.isError).toBe(true);
        const serverConfigForMigrationResult = service.getValueForMigration();
        expect(serverConfigForMigrationResult.isError).toBe(true);
    });

    it.each(numberValueCases)(`tests ${ROOMHIST_COUNT} - %o`, async $case => {
        const service = await setup({
            [ROOMHIST_COUNT]: $case.stringValue,
        });
        if ($case.expected === error) {
            const serverConfigResult = service.getValue();
            expect(serverConfigResult.isError).toBe(true);
        } else {
            const serverConfig = service.getValueForce();
            expect(serverConfig).toEqual({ ...defaultServerConfig, roomHistCount: $case.expected });
        }
        const serverConfigForMigration = service.getValueForMigrationForce();
        expect(serverConfigForMigration).toEqual(defaultServerConfigForMigration);
    });

    it.each([
        {
            stringValue: '{"dbName": "./test.sqlite"}',
            expected: { dbName: './test.sqlite' },
        },
        {
            stringValue: '{"clientUrl": "file://./test.sqlite"}',
            expected: { clientUrl: 'file://./test.sqlite' },
        },
        {
            stringValue: '{"dbName": "./test1.sqlite", "clientUrl": "file://./test2.sqlite"}',
            expected: { dbName: './test1.sqlite', clientUrl: 'file://./test2.sqlite' },
        },
        {
            stringValue: '{"dbName": "./test.sqlite", "driverOptions": {"optKey": "optValue"}}',
            expected: {
                dbName: './test.sqlite',
                driverOptions: { optKey: 'optValue' },
            },
        },
    ])(`tests ${SQLITE} as success - %o`, async $case => {
        const service = await setup({
            [SQLITE]: $case.stringValue,
        });

        const serverConfig = service.getValueForce();
        expect(serverConfig).toEqual({ ...defaultServerConfig, sqlite: $case.expected });
        const serverConfigForMigration = service.getValueForMigrationForce();
        expect(serverConfigForMigration).toEqual({
            ...defaultServerConfigForMigration,
            sqlite: $case.expected,
        });
    });

    it.each([
        {
            stringValue: 'https://invalid.example.com',
        },
        {
            stringValue: '{"invalidKey": "invalid_value"}',
        },
    ])(`tests ${SQLITE} as error - %o`, async $case => {
        const service = await setup({
            [SQLITE]: $case.stringValue,
        });
        const serverConfigResult = service.getValue();
        expect(serverConfigResult.isError).toBe(true);
        const serverConfigForMigrationResult = service.getValueForMigration();
        expect(serverConfigForMigrationResult.isError).toBe(true);
    });

    it.each(booleanlikeValueCases)(`tests ${EMBUPLOADER_ENABLED} - %o`, async $case => {
        const service = await setup({
            [EMBUPLOADER_ENABLED]: $case.stringValue,
        });
        if ($case.expected === error) {
            const serverConfigResult = service.getValue();
            expect(serverConfigResult.isError).toBe(true);
        } else {
            const serverConfig = service.getValueForce();
            expect(serverConfig).toEqual({
                ...defaultServerConfig,
                uploader: { enabled: $case.expected },
            });
        }
        const serverConfigForMigration = service.getValueForMigrationForce();
        expect(serverConfigForMigration).toEqual(defaultServerConfigForMigration);
    });

    it.each(numberValueCases)(`tests ${EMBUPLOADER_COUNT_QUOTA} - %o`, async $case => {
        const service = await setup({
            [EMBUPLOADER_COUNT_QUOTA]: $case.stringValue,
        });
        if ($case.expected === error) {
            const serverConfigResult = service.getValue();
            expect(serverConfigResult.isError).toBe(true);
        } else {
            const serverConfig = service.getValueForce();
            expect(serverConfig).toEqual({
                ...defaultServerConfig,
                uploader: {
                    enabled: false,
                    countQuota: $case.expected,
                },
            });
        }
        const serverConfigForMigration = service.getValueForMigrationForce();
        expect(serverConfigForMigration).toEqual(defaultServerConfigForMigration);
    });

    it.each(numberValueCases)(`tests ${EMBUPLOADER_MAX_SIZE} - %o`, async $case => {
        const service = await setup({
            [EMBUPLOADER_MAX_SIZE]: $case.stringValue,
        });
        if ($case.expected === error) {
            const serverConfigResult = service.getValue();
            expect(serverConfigResult.isError).toBe(true);
        } else {
            const serverConfig = service.getValueForce();
            expect(serverConfig).toEqual({
                ...defaultServerConfig,
                uploader: {
                    enabled: false,
                    maxFileSize: $case.expected,
                },
            });
        }
        const serverConfigForMigration = service.getValueForMigrationForce();
        expect(serverConfigForMigration).toEqual(defaultServerConfigForMigration);
    });

    it(`tests ${EMBUPLOADER_PATH}`, async () => {
        const service = await setup({
            [EMBUPLOADER_PATH]: './test_uploader_path',
        });
        const serverConfig = service.getValueForce();
        expect(serverConfig).toEqual({
            ...defaultServerConfig,
            uploader: {
                enabled: false,
                directory: './test_uploader_path',
            },
        });
        const serverConfigForMigration = service.getValueForMigrationForce();
        expect(serverConfigForMigration).toEqual(defaultServerConfigForMigration);
    });

    it.each(numberValueCases)(`tests ${EMBUPLOADER_SIZE_QUOTA} - %o`, async $case => {
        const service = await setup({
            [EMBUPLOADER_SIZE_QUOTA]: $case.stringValue,
        });
        if ($case.expected === error) {
            const serverConfigResult = service.getValue();
            expect(serverConfigResult.isError).toBe(true);
        } else {
            const serverConfig = service.getValueForce();
            expect(serverConfig).toEqual({
                ...defaultServerConfig,
                uploader: {
                    enabled: false,
                    sizeQuota: $case.expected,
                },
            });
        }
        const serverConfigForMigration = service.getValueForMigrationForce();
        expect(serverConfigForMigration).toEqual(defaultServerConfigForMigration);
    });
});
