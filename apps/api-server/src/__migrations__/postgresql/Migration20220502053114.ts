import { Migration } from '@mikro-orm/migrations';

export class Migration20220502053114 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table "room" add column "complete_updated_at" timestamptz(0) null;');
        this.addSql(
            'create index "room_complete_updated_at_index" on "room" ("complete_updated_at");',
        );
    }

    async down(): Promise<void> {
        this.addSql('drop index "room_complete_updated_at_index";');
        this.addSql('alter table "room" drop column "complete_updated_at";');
    }
}
