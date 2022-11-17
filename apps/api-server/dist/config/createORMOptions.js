'use strict';

var result = require('@kizahasi/result');
var env = require('../env.js');
var mikroOrm = require('../mikro-orm.js');
var appConsole = require('../utils/appConsole.js');
var determineDatabaseUrl = require('./determineDatabaseUrl.js');
var types = require('./types.js');

const createMySQLOptionsResult = (mysqlConfig, databaseArg, dirName) => {
    if (mysqlConfig == null) {
        if (databaseArg === types.mysql) {
            return result.Result.error(`使用するデータベースとしてMySQLが指定されましたが、設定が見つかりませんでした。${env.MYSQL}の値を設定する必要があります。`);
        }
        return result.Result.error(`使用するデータベースとしてPostgreSQLが指定されましたが、${env.MYSQL}の値が設定されていません。`);
    }
    const result$1 = mikroOrm.createMySQLOptions({
        dbName: mysqlConfig.dbName,
        dirName,
        clientUrl: mysqlConfig.clientUrl,
        driverOptions: mysqlConfig.driverOptions,
    });
    return result.Result.ok(result$1);
};
const createSQLiteOptionsResult = (sqliteConfig, dirName) => {
    const result$1 = mikroOrm.createSQLiteOptions({ sqliteConfig, dirName });
    return result.Result.ok(result$1);
};
const createPostgresOptionsResult = (postgresConfig, serverConfig, databaseArg, dirName) => {
    if (serverConfig.heroku) {
        if (serverConfig.databaseUrl != null) {
            const result$1 = mikroOrm.createPostgreSQLOptions({
                clientUrl: serverConfig.databaseUrl,
                dbName: undefined,
                driverOptions: {
                    connection: { ssl: { rejectUnauthorized: false } },
                },
                dirName,
            });
            return result.Result.ok(result$1);
        }
        appConsole.AppConsole.infoAsNoticeJa(`${env.HEROKU}の値がtrueですが、${env.DATABASE_URL}の値が見つかりませんでした。Heroku以外で動かしている可能性があります。${env.DATABASE_URL}によるデータベースの参照はスキップされます。`);
    }
    if (postgresConfig == null) {
        if (databaseArg === types.postgresql) {
            return result.Result.error(`使用するデータベースとしてPostgreSQLが指定されましたが、設定が見つかりませんでした。${env.POSTGRESQL}の値を設定する必要があります。Herokuの場合はHeroku Postgresをインストールしていてなおかつ${env.DATABASE_URL}の値が設定されていることを確認してください。`);
        }
        return result.Result.error(`使用するデータベースとしてPostgreSQLが指定されましたが、${env.POSTGRESQL}の値が設定されていません。`);
    }
    const result$1 = mikroOrm.createPostgreSQLOptions({
        dbName: postgresConfig.dbName,
        dirName,
        clientUrl: postgresConfig.clientUrl,
        driverOptions: postgresConfig.driverOptions,
    });
    return result.Result.ok(result$1);
};
const notOne = 'notOne';
const isExactlyOneServerConfig = (serverConfig) => {
    if (serverConfig.mysql == null) {
        if (serverConfig.postgresql == null) {
            if (serverConfig.sqlite == null) {
                return {
                    type: notOne,
                    mysql: undefined,
                    postgresql: undefined,
                    sqlite: undefined,
                };
            }
            else {
                return { type: types.sqlite, sqlite: serverConfig.sqlite };
            }
        }
        else {
            if (serverConfig.sqlite == null) {
                return { type: types.postgresql, postgresql: serverConfig.postgresql };
            }
            else {
                return {
                    type: notOne,
                    mysql: undefined,
                    postgresql: serverConfig.postgresql,
                    sqlite: serverConfig.sqlite,
                };
            }
        }
    }
    else {
        if (serverConfig.postgresql == null) {
            if (serverConfig.sqlite == null) {
                return {
                    type: types.mysql,
                    mysql: serverConfig.mysql,
                    postgresql: undefined,
                    sqlite: undefined,
                };
            }
            else {
                return {
                    type: notOne,
                    mysql: serverConfig.mysql,
                    sqlite: serverConfig.sqlite,
                };
            }
        }
        else {
            if (serverConfig.sqlite == null) {
                return {
                    type: notOne,
                    mysql: serverConfig.mysql,
                    postgresql: serverConfig.postgresql,
                };
            }
            else {
                return {
                    type: notOne,
                    mysql: serverConfig.mysql,
                    postgresql: serverConfig.postgresql,
                    sqlite: serverConfig.sqlite,
                };
            }
        }
    }
};
const seeDatabaseUrl = 'seeDatabaseUrl';
const createORMOptionsWithoutDatabaseUrl = (serverConfig, databaseArg, dirName) => {
    switch (databaseArg) {
        case null: {
            const exactlyOneServerConfigResult = isExactlyOneServerConfig(serverConfig);
            switch (exactlyOneServerConfigResult.type) {
                case types.mysql:
                    return createMySQLOptionsResult(exactlyOneServerConfigResult.mysql, databaseArg, dirName);
                case types.postgresql:
                    return createPostgresOptionsResult(exactlyOneServerConfigResult.postgresql, serverConfig, databaseArg, dirName);
                case types.sqlite:
                    return createSQLiteOptionsResult(exactlyOneServerConfigResult.sqlite, dirName);
                default: {
                    if (exactlyOneServerConfigResult.mysql == null) {
                        if (exactlyOneServerConfigResult.postgresql == null) {
                            return result.Result.ok(seeDatabaseUrl);
                        }
                        return result.Result.error(`Because ${env.POSTGRESQL} and ${env.SQLITE} are set in config, you must use --db parameter to specify a database to use.`);
                    }
                    if (exactlyOneServerConfigResult.postgresql == null) {
                        return result.Result.error(`Because ${env.MYSQL} and ${env.SQLITE} are set in config, you must use --db parameter to specify a database to use.`);
                    }
                    if (exactlyOneServerConfigResult.sqlite == null) {
                        return result.Result.error(`Because ${env.MYSQL} and ${env.POSTGRESQL} are set in config, you must use --db parameter to specify a database to use.`);
                    }
                    return result.Result.error(`Because ${env.MYSQL}, ${env.POSTGRESQL}, and ${env.SQLITE} are set in config, you must use --db parameter to specify a database to use.`);
                }
            }
        }
        case types.mysql: {
            if (serverConfig.mysql == null) {
                return result.Result.error(`使用するデータベースとしてMySQLが指定されましたが、${env.MYSQL}の値が設定されていません。`);
            }
            return createMySQLOptionsResult(serverConfig.mysql, databaseArg, dirName);
        }
        case types.sqlite: {
            if (serverConfig.sqlite == null) {
                return result.Result.error(`使用するデータベースとしてSQLiteが指定されましたが、${env.SQLITE}の値が設定されていません。`);
            }
            return createSQLiteOptionsResult(serverConfig.sqlite, dirName);
        }
        case types.postgresql: {
            return createPostgresOptionsResult(serverConfig.postgresql, serverConfig, databaseArg, dirName);
        }
    }
};
const createORMOptions = (serverConfig, databaseArg, dirName) => {
    const ormOptionsBaseResult = createORMOptionsWithoutDatabaseUrl(serverConfig, databaseArg, dirName);
    if (ormOptionsBaseResult.isError) {
        return ormOptionsBaseResult;
    }
    const ormOptionsBase = ormOptionsBaseResult.value;
    if (ormOptionsBase === seeDatabaseUrl) {
        if (serverConfig.databaseUrl == null) {
            return result.Result.error('Database config not found.');
        }
        const databaseUrlResult = determineDatabaseUrl.determineDatabaseUrl(serverConfig.databaseUrl);
        if (databaseUrlResult.isError) {
            return result.Result.error(databaseUrlResult.error.en);
        }
        switch (databaseUrlResult.value.type) {
            case types.mysql:
                return result.Result.ok(mikroOrm.createMySQLOptions({
                    clientUrl: databaseUrlResult.value.mysql.clientUrl,
                    dirName,
                    dbName: undefined,
                    driverOptions: undefined,
                }));
            case types.postgresql:
                return result.Result.ok(mikroOrm.createPostgreSQLOptions({
                    clientUrl: databaseUrlResult.value.postgresql.clientUrl,
                    dirName,
                    dbName: undefined,
                    driverOptions: serverConfig.heroku
                        ? {
                            connection: { ssl: { rejectUnauthorized: false } },
                        }
                        : undefined,
                }));
            case types.sqlite:
                return result.Result.ok(mikroOrm.createSQLiteOptions({
                    sqliteConfig: {
                        clientUrl: databaseUrlResult.value.sqlite.clientUrl,
                        dbName: undefined,
                    },
                    dirName,
                }));
        }
    }
    if (serverConfig.databaseUrl != null) {
        appConsole.AppConsole.infoAsNoticeJa(`${env.MYSQL}, ${env.POSTGRESQL}, ${env.SQLITE} においてデータベースが設定されているため、${env.DATABASE_URL} の値は無視されました。`);
    }
    return result.Result.ok(ormOptionsBase);
};

exports.createORMOptions = createORMOptions;
//# sourceMappingURL=createORMOptions.js.map
