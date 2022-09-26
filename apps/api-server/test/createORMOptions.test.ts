import { createORMOptions } from '../src/config/createORMOptions';
import { ServerConfigForMigration, mysql, postgresql, sqlite } from '../src/config/types';

type Params = {
    serverConfig: ServerConfigForMigration;
    databaseArg?: typeof postgresql | typeof sqlite | typeof mysql | undefined;
};

const createORMOptionsResult = ({ serverConfig, databaseArg }: Params) => {
    return createORMOptions(serverConfig, databaseArg ?? null, 'src', false);
};

const toBeOk = (params: Params) => {
    const result = createORMOptionsResult(params);
    if (result.isError) {
        expect(result.error).toBeUndefined();
        throw new Error('Guard');
    }
    return result.value;
};

const toBeError = (params: Params) => {
    const result = createORMOptionsResult(params);
    if (!result.isError) {
        expect(result.value).toBeUndefined();
        throw new Error('Guard');
    }
    return result.error;
};

const defaultServerConfig: ServerConfigForMigration = {
    heroku: false,
    databaseUrl: undefined,
    mysql: undefined,
    postgresql: undefined,
    sqlite: undefined,
};

describe('createORMOptions', () => {
    it('tests empty serverConfig', () => {
        toBeError({
            serverConfig: defaultServerConfig,
        });
    });

    it('tests PostgreSQL by postgresql', () => {
        const actual = toBeOk({
            serverConfig: {
                ...defaultServerConfig,
                postgresql: { clientUrl: 'postgresql://localhost' },
            },
        });
        expect(actual.type).toBe('postgresql');
        expect(actual.clientUrl).toBe('postgresql://localhost');
        expect(actual.driverOptions).toBeFalsy();
    });

    it('tests PostgreSQL by databaseUrl', () => {
        const actual = toBeOk({
            serverConfig: {
                ...defaultServerConfig,
                databaseUrl: 'postgresql://localhost',
            },
        });
        expect(actual.type).toBe('postgresql');
        expect(actual.clientUrl).toBe('postgresql://localhost');
        expect(actual.driverOptions).toBeFalsy();
    });

    it('tests MySQL by mysql', () => {
        const actual = toBeOk({
            serverConfig: {
                ...defaultServerConfig,
                mysql: { clientUrl: 'mysql://localhost' },
            },
        });
        expect(actual.type).toBe('mysql');
        expect(actual.clientUrl).toBe('mysql://localhost');
        expect(actual.driverOptions).toBeFalsy();
    });

    it('tests MySQL by databaseUrl', () => {
        const actual = toBeOk({
            serverConfig: {
                ...defaultServerConfig,
                databaseUrl: 'mysql://localhost',
            },
        });
        expect(actual.type).toBe('mysql');
        expect(actual.clientUrl).toBe('mysql://localhost');
        expect(actual.driverOptions).toBeFalsy();
    });

    it('tests SQLite by sqlite', () => {
        const actual = toBeOk({
            serverConfig: {
                ...defaultServerConfig,
                sqlite: { dbName: './main.sqlite', clientUrl: undefined },
            },
        });
        expect(actual.type).toBe('sqlite');
        expect(actual.dbName).toBe('./main.sqlite');
        expect(actual.clientUrl).toBeUndefined();
        expect(actual.driverOptions).toBeFalsy();
    });

    it('tests SQLite by databaseUrl', () => {
        const actual = toBeOk({
            serverConfig: {
                ...defaultServerConfig,
                databaseUrl: 'file://./main.sqlite',
            },
        });
        expect(actual.type).toBe('sqlite');
        expect(actual.dbName).toBeUndefined();
        expect(actual.clientUrl).toBe('file://./main.sqlite');
        expect(actual.driverOptions).toBeFalsy();
    });

    it('tests heroku', () => {
        const actual = toBeOk({
            serverConfig: {
                ...defaultServerConfig,
                heroku: true,
                databaseUrl: 'postgresql://localhost',
            },
        });
        expect(actual.type).toBe('postgresql');
        expect(actual.clientUrl).toBe('postgresql://localhost');
        expect(actual.driverOptions).toEqual({
            connection: { ssl: { rejectUnauthorized: false } },
        });
    });

    it('tests invalid databaseUrl', () => {
        toBeError({
            serverConfig: {
                ...defaultServerConfig,
                databaseUrl: 'https://invalid.example.com',
            },
        });
    });

    it.each([undefined, 'https://invalid.example.com'])(
        'tests multiple databases with databaseArg=postgresql',
        databaseUrl => {
            const actual = toBeOk({
                serverConfig: {
                    ...defaultServerConfig,
                    databaseUrl,
                    mysql: { clientUrl: 'mysql://localhost' },
                    postgresql: { clientUrl: 'postgresql://localhost' },
                    sqlite: { dbName: './main.sqlite', clientUrl: undefined },
                },
                databaseArg: 'postgresql',
            });
            expect(actual.type).toBe('postgresql');
            expect(actual.clientUrl).toBe('postgresql://localhost');
            expect(actual.driverOptions).toBeFalsy();
        }
    );

    it.each([undefined, 'https://invalid.example.com'])(
        'tests multiple databases with databaseArg=mysql',
        databaseUrl => {
            const actual = toBeOk({
                serverConfig: {
                    ...defaultServerConfig,
                    databaseUrl,
                    mysql: { clientUrl: 'mysql://localhost' },
                    postgresql: { clientUrl: 'postgresql://localhost' },
                    sqlite: { dbName: './main.sqlite', clientUrl: undefined },
                },
                databaseArg: 'mysql',
            });
            expect(actual.type).toBe('mysql');
            expect(actual.clientUrl).toBe('mysql://localhost');
            expect(actual.driverOptions).toBeFalsy();
        }
    );

    it.each([undefined, 'https://invalid.example.com'])(
        'tests multiple databases with databaseArg=sqlite',
        databaseUrl => {
            const actual = toBeOk({
                serverConfig: {
                    ...defaultServerConfig,
                    databaseUrl,
                    mysql: { clientUrl: 'mysql://localhost' },
                    postgresql: { clientUrl: 'postgresql://localhost' },
                    sqlite: { dbName: './main.sqlite', clientUrl: undefined },
                },
                databaseArg: 'sqlite',
            });
            expect(actual.type).toBe('sqlite');
            expect(actual.dbName).toBe('./main.sqlite');
            expect(actual.driverOptions).toBeFalsy();
        }
    );
});
