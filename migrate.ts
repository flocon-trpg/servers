
import { Connection, IDatabaseDriver, MikroORM } from '@mikro-orm/core';
import { loadServerConfigAsMigrationCreate, loadServerConfigAsMigrationUp } from './src/config';
import { createPostgreSQL, createSQLite } from './src/mikro-orm';

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

export const migrate = async (type: typeof create | typeof createInitial | typeof up) => {
    const serverConfig = (() => {
        if (type === up) {
            return loadServerConfigAsMigrationUp();
        }
        return loadServerConfigAsMigrationCreate();
    })();

    let orm: MikroORM<IDatabaseDriver<Connection>>;
    let dbType: DBType;
    // TODO: 他のDBにも対応させる
    switch (serverConfig.database.__type) {
        case sqlite:
            orm = await createSQLite({ ...serverConfig.database.sqlite, debug: true });
            dbType = sqlite;
            break;
        case postgresql:
            orm = await createPostgreSQL({ ...serverConfig.database.postgresql, debug: true });
            dbType = postgresql;
            break;
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