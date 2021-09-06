import { Migration } from '@mikro-orm/migrations';

export class Migration20210906145200 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table "room" add column "created_at" timestamptz(0) null;');
        this.addSql('create index "room_created_at_index" on "room" ("created_at");');
    }
}
