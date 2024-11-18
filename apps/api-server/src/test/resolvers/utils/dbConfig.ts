import { ServerConfig } from '../../../server-config/server-config.service';
import { mySQLClientUrl, postgresClientUrl } from './databaseConfig';

export type DbConfig =
    | {
          type: 'SQLite';
          dbName: string;
      }
    | {
          type: 'PostgreSQL';
      }
    | { type: 'MySQL' };

export const createDatabaseConfig = (
    dbConfig: DbConfig,
): Pick<ServerConfig, 'postgresql' | 'mysql' | 'sqlite'> => {
    switch (dbConfig.type) {
        case 'MySQL':
            return {
                mysql: {
                    clientUrl: mySQLClientUrl,
                    dbName: 'test',
                    driverOptions: undefined,
                },
                postgresql: undefined,
                sqlite: undefined,
            };
        case 'PostgreSQL':
            return {
                mysql: undefined,
                postgresql: {
                    clientUrl: postgresClientUrl,
                    dbName: 'test',
                    driverOptions: undefined,
                },
                sqlite: undefined,
            };
        case 'SQLite':
            return {
                mysql: undefined,
                postgresql: undefined,
                sqlite: {
                    dbName: dbConfig.dbName,
                    clientUrl: undefined,
                    driverOptions: undefined,
                },
            };
    }
};
