
import { Connection, IDatabaseDriver, MikroORM } from '@mikro-orm/core';
import { createPostgreSQL, createSQLite } from './src/mikro-orm';
import { serverConfig } from './src/config';

const create = 'create';
const createInitial = 'create-initial';
const up = 'up';

const sqlite = 'sqlite';
const postgresql = 'postgresql';

type DBType = typeof sqlite | typeof postgresql

const prettify = (dbType: DBType) => {
    switch (dbType) {
        case sqlite:
            return 'SQLite';
        case postgresql:
            return 'PostgreSQL';
    }
};

const tooManyArgsError = 'too many arguments';

const main = async () => {
    let type: typeof create | typeof createInitial | typeof up;
    let dbArg: string | undefined = undefined;

    const args = process.argv.slice(2);
    if (args[0] === create || args[0] === createInitial || args[0] === up) {
        type = args[0];
        dbArg = args[1];
        if (args.length >= 3) {
            throw tooManyArgsError;
        }
    } else {
        type = up;
        dbArg = args[0];
        if (args.length >= 2) {
            throw tooManyArgsError;
        }
    }

    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let dbType: DBType;
    // TODO: 他のDBにも対応させる
    switch (dbArg) {
        case sqlite:
            if (serverConfig.database.__type !== sqlite) {
                throw 'Database type in server-config.json is not SQLite.';
            }
            orm = await createSQLite({ ...serverConfig.database.sqlite, debug: true });
            dbType = sqlite;
            break;
        case postgresql:
            if (serverConfig.database.__type !== postgresql) {
                throw 'Database type in server-config.json is not PostgreSQL.';
            }
            orm = await createPostgreSQL({ ...serverConfig.database.postgresql, debug: true });
            dbType = postgresql;
            break;
        case undefined:
            throw 'DB type must be specified';
        default:
            throw `${dbArg} is not supported DB type`;
    }

    if (type === create) {
        console.log(`migration-create started. DB type is ${prettify(dbType)}`);
        try {
            const migrator = orm.getMigrator();
            await migrator.createMigration();
        }
        finally {
            // これがないとターミナルなどで実行したときに自動で終わらない。
            await orm.close();
        }
        console.log(`😊 migration-create is successfully finished. DB type is ${prettify(dbType)}`);
        return;
    }

    if (type === createInitial) {
        console.log(`migration-create-initial started. DB type is ${prettify(dbType)}`);
        try {
            const migrator = orm.getMigrator();
            await migrator.createInitialMigration();
        }
        finally {
            // これがないとターミナルなどで実行したときに自動で終わらない。
            await orm.close();
        }
        console.log(`😊 migration-create-initial is successfully finished. DB type is ${prettify(dbType)}`);
        return;
    }

    console.log(`migration-up started. DB type is ${prettify(dbType)}`);
    try {
        const migrator = orm.getMigrator();
        const migrations = await migrator.getPendingMigrations();
        if (migrations && migrations.length > 0) {
            console.log('migrations found. migrating...');
            await migrator.up();
        } else {
            console.log('no migration found.');
        }
    }
    finally {
        // これがないとターミナルなどで実行したときに自動で終わらない。
        await orm.close();
    }
    console.log(`😊 migration-up is successfully finished. DB type is ${prettify(dbType)}`);
};

main().catch(err => {
    console.log(err);
    console.log('❌ migration failed.');
});