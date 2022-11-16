import './beforeAllGlobal';
import { Result } from '@kizahasi/result';
import { ServerConfigParser } from '../src/config/serverConfigParser';
import { WritableServerConfig, WritableServerConfigForMigration } from '../src/config/types';
import { logger } from '@/logger';

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

describe('serverConfigParser', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('tests empty serverConfig', () => {
        const actual = new ServerConfigParser({});
        expect(actual.serverConfig).toEqual(Result.ok(defaultServerConfig));
        expect(actual.serverConfigForMigration).toEqual(Result.ok(defaultServerConfigForMigration));
    });

    it('tests ACCESS_CONTROL_ALLOW_ORIGIN', () => {
        const actual = new ServerConfigParser({
            ACCESS_CONTROL_ALLOW_ORIGIN: 'https://example.com',
        });
        expect(actual.serverConfig.value).toEqual({
            ...defaultServerConfig,
            accessControlAllowOrigin: 'https://example.com',
        });
        expect(actual.serverConfigForMigration).toEqual(Result.ok(defaultServerConfigForMigration));
    });

    it('tests FLOCON_ADMIN to be ok', () => {
        const actual = new ServerConfigParser({ FLOCON_ADMIN: 'abcdef' });
        expect(actual.serverConfig).toEqual(
            Result.ok({ ...defaultServerConfig, admins: ['abcdef'] })
        );
        expect(actual.serverConfigForMigration).toEqual(Result.ok(defaultServerConfigForMigration));
    });

    it('tests FLOCON_ADMIN to be error', () => {
        const actual = new ServerConfigParser({ FLOCON_ADMIN: 'abcdef!' });
        expect(actual.serverConfig.error).toBeTruthy();
        expect(actual.serverConfigForMigration.error).toBeFalsy();
    });

    it.each(booleanlikeValueCases)('tests AUTO_MIGRATION %o', $case => {
        const actual = new ServerConfigParser({ AUTO_MIGRATION: $case.stringValue });
        if ($case.expected === error) {
            expect(actual.serverConfig.error).toBeTruthy();
        } else {
            expect(actual.serverConfig).toEqual(
                Result.ok({
                    ...defaultServerConfig,
                    autoMigration: $case.expected,
                })
            );
        }
        expect(actual.serverConfigForMigration).toEqual(Result.ok(defaultServerConfigForMigration));
    });

    it('tests DATABASE_URL', () => {
        const actual = new ServerConfigParser({ DATABASE_URL: 'postgres://postgres:postgres' });
        expect(actual.serverConfig).toEqual(
            Result.ok({
                ...defaultServerConfig,
                databaseUrl: 'postgres://postgres:postgres',
            })
        );
        expect(actual.serverConfigForMigration).toEqual(
            Result.ok({
                ...defaultServerConfigForMigration,
                databaseUrl: 'postgres://postgres:postgres',
            })
        );
    });

    it.each(booleanlikeValueCases)('tests FLOCON_API_DISABLE_RATE_LIMIT_EXPERIMENTAL %o', $case => {
        const actual = new ServerConfigParser({
            FLOCON_API_DISABLE_RATE_LIMIT_EXPERIMENTAL: $case.stringValue,
        });
        if ($case.expected === error) {
            expect(actual.serverConfig.error).toBeTruthy();
        } else {
            expect(actual.serverConfig).toEqual(
                Result.ok({
                    ...defaultServerConfig,
                    disableRateLimitExperimental: $case.expected,
                })
            );
        }
        expect(actual.serverConfigForMigration).toEqual(Result.ok(defaultServerConfigForMigration));
    });

    it.each([
        {
            actual: '{"type": "none"}',
            expected: undefined,
        },
        {
            actual: '{"type": "plain", "value": "passw0rd"}',
            expected: { type: 'plain', value: 'passw0rd' },
        },
        {
            actual: '{"type": "bcrypt", "value": "passw0rd:hash"}',
            expected: { type: 'bcrypt', value: 'passw0rd:hash' },
        },
    ])('tests ENTRY_PASSWORD %o', $case => {
        const actual = new ServerConfigParser({
            ENTRY_PASSWORD: $case.actual,
        });
        expect(actual.serverConfig).toEqual(
            Result.ok({
                ...defaultServerConfig,
                entryPassword: $case.expected,
            })
        );
        expect(actual.serverConfigForMigration).toEqual(Result.ok(defaultServerConfigForMigration));
    });

    it.each([
        {
            actual: 'not_json',
        },
        {
            actual: '{"type": "none", value: "none_value"}',
        },
        {
            actual: '{"type": "plain"}',
        },
        {
            actual: '{"value": "passw0rd"}',
        },
    ])('tests ENTRY_PASSWORD %o', $case => {
        const actual = new ServerConfigParser({
            ENTRY_PASSWORD: $case.actual,
        });
        expect(actual.serverConfig.error).toBeTruthy();
        expect(actual.serverConfigForMigration.error).toBeFalsy();
    });

    it.each([
        {
            actual: '{"client_email": "test@example.com", "private_key": "test_private_key"}',
            expected: { client_email: 'test@example.com', private_key: 'test_private_key' },
        },
        {
            actual: '{"client_email": "test@example.com", "private_key": "test_private_key", "project_id": "test_project_id"}',
            expected: {
                client_email: 'test@example.com',
                private_key: 'test_private_key',
                project_id: 'test_project_id',
            },
        },
    ])('tests FIREBASE_ADMIN_SECRET %o', $case => {
        const actual = new ServerConfigParser({
            FIREBASE_ADMIN_SECRET: $case.actual,
        });
        expect(actual.serverConfig).toEqual(
            Result.ok({
                ...defaultServerConfig,
                firebaseAdminSecret: $case.expected,
            })
        );
        expect(actual.serverConfigForMigration).toEqual(Result.ok(defaultServerConfigForMigration));
    });

    it.each([
        {
            actual: '{"private_key": "test_private_key"}',
        },
        {
            actual: '{"client_email": "test@example.com"}',
        },
        {
            actual: '{"project_id": "test_project_id"}',
        },
        {
            actual: 'not_json',
        },
    ])('tests FIREBASE_ADMIN_SECRET %o', $case => {
        const actual = new ServerConfigParser({
            FIREBASE_ADMIN_SECRET: $case.actual,
        });
        expect(actual.serverConfig.error).toBeTruthy();
        expect(actual.serverConfigForMigration.error).toBeFalsy();
    });

    it('tests FIREBASE_PROJECTID', () => {
        const actual = new ServerConfigParser({ FIREBASE_PROJECTID: 'test_project_id' });
        expect(actual.serverConfig).toEqual(
            Result.ok({
                ...defaultServerConfig,
                firebaseProjectId: 'test_project_id',
            })
        );
        expect(actual.serverConfigForMigration).toEqual(Result.ok(defaultServerConfigForMigration));
    });

    it('tests FIREBASE_PROJECT_ID', () => {
        const actual = new ServerConfigParser({ FIREBASE_PROJECT_ID: 'test_project_id' });
        expect(actual.serverConfig).toEqual(
            Result.ok({
                ...defaultServerConfig,
                firebaseProjectId: 'test_project_id',
            })
        );
        expect(actual.serverConfigForMigration).toEqual(Result.ok(defaultServerConfigForMigration));
    });

    it('should ignore FIREBASE_PROJECTID if FIREBASE_PROJECT_ID is set', () => {
        const mock = jest.spyOn(logger.get(), 'warn');
        const actual = new ServerConfigParser({
            FIREBASE_PROJECT_ID: 'test_project_id1',
            FIREBASE_PROJECTID: 'test_project_id2',
        });
        expect(actual.serverConfig).toEqual(
            Result.ok({
                ...defaultServerConfig,
                firebaseProjectId: 'test_project_id1',
            })
        );
        expect(actual.serverConfigForMigration).toEqual(Result.ok(defaultServerConfigForMigration));
        expect(mock.mock.calls).toHaveLength(1);
    });

    it.each(booleanlikeValueCases)('tests HEROKU %o', $case => {
        const actual = new ServerConfigParser({
            HEROKU: $case.stringValue,
        });
        if ($case.expected === error) {
            expect(actual.serverConfig.error).toBeTruthy();
        } else {
            expect(actual.serverConfig).toEqual(
                Result.ok({
                    ...defaultServerConfig,
                    heroku: $case.expected,
                })
            );
        }
        if ($case.expected === error) {
            expect(actual.serverConfigForMigration.error).toBeTruthy();
        } else {
            expect(actual.serverConfigForMigration).toEqual(
                Result.ok({
                    ...defaultServerConfigForMigration,
                    heroku: $case.expected,
                })
            );
        }
    });

    it.each([
        {
            actual: '{"clientUrl": "mysql://mysql:mysql"}',
            expected: { clientUrl: 'mysql://mysql:mysql' },
        },
        {
            actual: '{"clientUrl": "mysql://mysql:mysql", "driverOptions": {"optKey": "optValue"}}',
            expected: { clientUrl: 'mysql://mysql:mysql', driverOptions: { optKey: 'optValue' } },
        },
    ])('tests MYSQL %o', $case => {
        const actual = new ServerConfigParser({
            MYSQL: $case.actual,
        });
        expect(actual.serverConfig).toEqual(
            Result.ok({
                ...defaultServerConfig,
                mysql: $case.expected,
            })
        );
        expect(actual.serverConfigForMigration).toEqual(
            Result.ok({
                ...defaultServerConfigForMigration,
                mysql: $case.expected,
            })
        );
    });

    it.each([
        {
            actual: 'https://invalid.example.com',
        },
        {
            actual: '{"invalidKey": "invalid_value"}',
        },
    ])('tests MYSQL %o', $case => {
        const actual = new ServerConfigParser({
            MYSQL: $case.actual,
        });
        expect(actual.serverConfig.error).toBeTruthy();
        expect(actual.serverConfigForMigration.error).toBeTruthy();
    });

    it.each([
        {
            actual: '{"clientUrl": "postgresql://postgresql:postgresql"}',
            expected: { clientUrl: 'postgresql://postgresql:postgresql' },
        },
        {
            actual: '{"clientUrl": "postgresql://postgresql:postgresql", "driverOptions": {"optKey": "optValue"}}',
            expected: {
                clientUrl: 'postgresql://postgresql:postgresql',
                driverOptions: { optKey: 'optValue' },
            },
        },
    ])('tests POSTGRESQL %o', $case => {
        const actual = new ServerConfigParser({
            POSTGRESQL: $case.actual,
        });
        expect(actual.serverConfig).toEqual(
            Result.ok({
                ...defaultServerConfig,
                postgresql: $case.expected,
            })
        );
        expect(actual.serverConfigForMigration).toEqual(
            Result.ok({
                ...defaultServerConfigForMigration,
                postgresql: $case.expected,
            })
        );
    });

    it.each([
        {
            actual: 'https://invalid.example.com',
        },
        {
            actual: '{"invalidKey": "invalid_value"}',
        },
    ])('tests POSTGRESQL %o', $case => {
        const actual = new ServerConfigParser({
            POSTGRESQL: $case.actual,
        });
        expect(actual.serverConfig.error).toBeTruthy();
        expect(actual.serverConfigForMigration.error).toBeTruthy();
    });

    it.each(numberValueCases)('tests ROOMHIST_COUNT %o', $case => {
        const actual = new ServerConfigParser({
            ROOMHIST_COUNT: $case.stringValue,
        });
        if ($case.expected === error) {
            expect(actual.serverConfig.error).toBeTruthy();
        } else {
            expect(actual.serverConfig).toEqual(
                Result.ok({
                    ...defaultServerConfig,
                    roomHistCount: $case.expected,
                })
            );
        }
        expect(actual.serverConfigForMigration).toEqual(Result.ok(defaultServerConfigForMigration));
    });

    it.each([
        {
            actual: '{"dbName": "./test.sqlite"}',
            expected: { dbName: './test.sqlite' },
        },
        {
            actual: '{"clientUrl": "file://./test.sqlite"}',
            expected: { clientUrl: 'file://./test.sqlite' },
        },
        {
            actual: '{"dbName": "./test1.sqlite", "clientUrl": "file://./test2.sqlite"}',
            expected: { dbName: './test1.sqlite', clientUrl: 'file://./test2.sqlite' },
        },
        {
            actual: '{"dbName": "./test.sqlite", "driverOptions": {"optKey": "optValue"}}',
            expected: {
                dbName: './test.sqlite',
                driverOptions: { optKey: 'optValue' },
            },
        },
    ])('tests SQLITE %o', $case => {
        const actual = new ServerConfigParser({
            SQLITE: $case.actual,
        });
        expect(actual.serverConfig).toEqual(
            Result.ok({
                ...defaultServerConfig,
                sqlite: $case.expected,
            })
        );
        expect(actual.serverConfigForMigration).toEqual(
            Result.ok({
                ...defaultServerConfigForMigration,
                sqlite: $case.expected,
            })
        );
    });

    it.each([
        {
            actual: 'https://invalid.example.com',
        },
        {
            actual: '{"invalidKey": "invalid_value"}',
        },
    ])('tests SQLITE %o', $case => {
        const actual = new ServerConfigParser({
            SQLITE: $case.actual,
        });
        expect(actual.serverConfig.error).toBeTruthy();
        expect(actual.serverConfigForMigration.error).toBeTruthy();
    });

    it.each(booleanlikeValueCases)('tests EMBUPLOADER_ENABLED %o', $case => {
        const actual = new ServerConfigParser({
            EMBUPLOADER_ENABLED: $case.stringValue,
        });
        if ($case.expected === error) {
            expect(actual.serverConfig.error).toBeTruthy();
        } else {
            expect(actual.serverConfig).toEqual(
                Result.ok({
                    ...defaultServerConfig,
                    uploader: {
                        enabled: $case.expected,
                    },
                })
            );
        }
        expect(actual.serverConfigForMigration).toEqual(Result.ok(defaultServerConfigForMigration));
    });

    it.each(numberValueCases)('tests EMBUPLOADER_COUNT_QUOTA %o', $case => {
        const actual = new ServerConfigParser({
            EMBUPLOADER_COUNT_QUOTA: $case.stringValue,
        });
        if ($case.expected === error) {
            expect(actual.serverConfig.error).toBeTruthy();
        } else {
            expect(actual.serverConfig).toEqual(
                Result.ok({
                    ...defaultServerConfig,
                    uploader: {
                        enabled: false,
                        countQuota: $case.expected,
                    },
                })
            );
        }
        expect(actual.serverConfigForMigration).toEqual(Result.ok(defaultServerConfigForMigration));
    });

    it.each(numberValueCases)('tests EMBUPLOADER_MAX_SIZE %o', $case => {
        const actual = new ServerConfigParser({
            EMBUPLOADER_MAX_SIZE: $case.stringValue,
        });
        if ($case.expected === error) {
            expect(actual.serverConfig.error).toBeTruthy();
        } else {
            expect(actual.serverConfig).toEqual(
                Result.ok({
                    ...defaultServerConfig,
                    uploader: {
                        enabled: false,
                        maxFileSize: $case.expected,
                    },
                })
            );
        }
        expect(actual.serverConfigForMigration).toEqual(Result.ok(defaultServerConfigForMigration));
    });

    it('tests EMBUPLOADER_PATH', () => {
        const actual = new ServerConfigParser({
            EMBUPLOADER_PATH: './test_uploader_path',
        });
        expect(actual.serverConfig).toEqual(
            Result.ok({
                ...defaultServerConfig,
                uploader: {
                    enabled: false,
                    directory: './test_uploader_path',
                },
            })
        );
        expect(actual.serverConfigForMigration).toEqual(Result.ok(defaultServerConfigForMigration));
    });

    it.each(numberValueCases)('tests EMBUPLOADER_SIZE_QUOTA %o', $case => {
        const actual = new ServerConfigParser({
            EMBUPLOADER_SIZE_QUOTA: $case.stringValue,
        });
        if ($case.expected === error) {
            expect(actual.serverConfig.error).toBeTruthy();
        } else {
            expect(actual.serverConfig).toEqual(
                Result.ok({
                    ...defaultServerConfig,
                    uploader: {
                        enabled: false,
                        sizeQuota: $case.expected,
                    },
                })
            );
        }
        expect(actual.serverConfigForMigration).toEqual(Result.ok(defaultServerConfigForMigration));
    });
});
