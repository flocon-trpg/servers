import { MikroORM } from '@mikro-orm/core';
import { BeforeApplicationShutdown, Injectable, OnModuleDestroy } from '@nestjs/common';
import { ServerConfigService } from '../server-config/server-config.service';
import { EM, ORM } from '../types';
import { DbType, YargsService } from '../yargs/yargs.service';
import { createORMOptions } from './utils/createORMOptions';
import { DirName } from './utils/mikro-orm';

@Injectable()
export class MikroOrmService implements OnModuleDestroy {
    #ormCacheForMain: ORM | undefined;

    public constructor(
        private readonly serverConfigService: ServerConfigService,
        private readonly yargsService: YargsService,
    ) {}

    // テストでは app を複数回作ったり close することがあるので、ORM の close 忘れを防ぐためにここで close を呼び出している
    async onModuleDestroy() {
        if (this.#ormCacheForMain != null) {
            await this.#ormCacheForMain.close();
        }
    }

    async #createOrm(dbType: DbType | null, dirName: DirName): Promise<ORM> {
        const serverConfig = this.serverConfigService.getValueForMigration();
        if (serverConfig.isError) {
            throw new Error(`serverConfig has errors thus cannot create EM. ${serverConfig.error}`);
        }
        const options = createORMOptions(serverConfig.value, dbType, dirName);
        if (options.isError) {
            throw new Error(`ORMOptions has errors thus cannot create EM. ${options.error}`);
        }
        return await MikroORM.init(options.value);
    }

    public async getOrmForMain(): Promise<ORM> {
        if (this.#ormCacheForMain != null) {
            return this.#ormCacheForMain;
        }
        const yargs = await this.yargsService.getMain();
        this.#ormCacheForMain = await this.#createOrm(yargs.db, 'dist');
        return this.#ormCacheForMain;
    }

    public async createOrmForMigrationDown(dirName: DirName): Promise<ORM> {
        const yargs = await this.yargsService.getMigrationDown();
        return await this.#createOrm(yargs.db, dirName);
    }

    public async createOrmForMigrationUpOrCheck(dirName: DirName): Promise<ORM> {
        const yargs = await this.yargsService.getMigrationUpOrCheck();
        return await this.#createOrm(yargs.db, dirName);
    }

    public async createOrmForMigrationCreate(dirName: DirName): Promise<ORM> {
        const yargs = await this.yargsService.getMigrationCreate();
        return await this.#createOrm(yargs.db, dirName);
    }

    public async forkEmForMain(): Promise<EM> {
        const orm = await this.getOrmForMain();
        return orm.em.fork();
    }
}
