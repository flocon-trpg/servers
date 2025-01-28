import { YargsService } from './yargs.service';

type Main = Awaited<ReturnType<YargsService['getMain']>>;
type MigrationCreate = Awaited<ReturnType<YargsService['getMigrationCreate']>>;
type MigrationDown = Awaited<ReturnType<YargsService['getMigrationDown']>>;
type MigrationUpOrCheck = Awaited<ReturnType<YargsService['getMigrationUpOrCheck']>>;

export class YargsServiceStub
    implements
        Pick<
            YargsService,
            'getMain' | 'getMigrationCreate' | 'getMigrationDown' | 'getMigrationUpOrCheck'
        >
{
    public main: Main | undefined;
    public migrationCreate: MigrationCreate | undefined;
    public migrationDown: MigrationDown | undefined;
    public migrationUpOrCheck: MigrationUpOrCheck | undefined;

    public constructor({
        main,
        migrationCreate,
        migrationDown,
        migrationUpOrCheck,
    }: {
        main?: Main;
        migrationCreate?: MigrationCreate;
        migrationDown?: MigrationDown;
        migrationUpOrCheck?: MigrationUpOrCheck;
    }) {
        this.main = main;
        this.migrationCreate = migrationCreate;
        this.migrationDown = migrationDown;
        this.migrationUpOrCheck = migrationUpOrCheck;
    }

    async getMain(): Promise<Main> {
        if (this.main == null) {
            throw new Error('main is not set at YargsServiceMock');
        }
        return this.main;
    }
    async getMigrationCreate(): Promise<MigrationCreate> {
        if (this.migrationCreate == null) {
            throw new Error('migrationCreate is not set at YargsServiceMock');
        }
        return this.migrationCreate;
    }
    async getMigrationDown(): Promise<MigrationDown> {
        if (this.migrationDown == null) {
            throw new Error('migrationDown is not set at YargsServiceMock');
        }
        return this.migrationDown;
    }
    async getMigrationUpOrCheck(): Promise<MigrationUpOrCheck> {
        if (this.migrationUpOrCheck == null) {
            throw new Error('migrationUpOrCheck is not set at YargsServiceMock');
        }
        return this.migrationUpOrCheck;
    }
}
