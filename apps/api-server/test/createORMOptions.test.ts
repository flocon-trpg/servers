import { createORMOptions } from '../src/config/createORM';
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

    it('tests PostgreSQL', () => {
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

    it('tests MySQL', () => {
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

    it('tests SQLite', () => {
        const actual = toBeOk({
            serverConfig: {
                ...defaultServerConfig,
                sqlite: { dbName: './main.sqlite' },
            },
        });
        expect(actual.type).toBe('sqlite');
        expect(actual.dbName).toBe('./main.sqlite');
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

    it('tests multiple databases with databaseArg=postgresql', () => {
        const actual = toBeOk({
            serverConfig: {
                ...defaultServerConfig,
                mysql: { clientUrl: 'mysql://localhost' },
                postgresql: { clientUrl: 'postgresql://localhost' },
                sqlite: { dbName: './main.sqlite' },
            },
            databaseArg: 'postgresql',
        });
        expect(actual.type).toBe('postgresql');
        expect(actual.clientUrl).toBe('postgresql://localhost');
        expect(actual.driverOptions).toBeFalsy();
    });

    it('tests multiple databases with databaseArg=mysql', () => {
        const actual = toBeOk({
            serverConfig: {
                ...defaultServerConfig,
                mysql: { clientUrl: 'mysql://localhost' },
                postgresql: { clientUrl: 'postgresql://localhost' },
                sqlite: { dbName: './main.sqlite' },
            },
            databaseArg: 'mysql',
        });
        expect(actual.type).toBe('mysql');
        expect(actual.clientUrl).toBe('mysql://localhost');
        expect(actual.driverOptions).toBeFalsy();
    });

    it('tests multiple databases with databaseArg=sqlite', () => {
        const actual = toBeOk({
            serverConfig: {
                ...defaultServerConfig,
                mysql: { clientUrl: 'mysql://localhost' },
                postgresql: { clientUrl: 'postgresql://localhost' },
                sqlite: { dbName: './main.sqlite' },
            },
            databaseArg: 'sqlite',
        });
        expect(actual.type).toBe('sqlite');
        expect(actual.dbName).toBe('./main.sqlite');
        expect(actual.driverOptions).toBeFalsy();
    });
});
