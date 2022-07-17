import { Migration } from '@mikro-orm/migrations';

export class Migration20220630151907 extends Migration {
    async up(): Promise<void> {
        this.addSql(
            'alter table "room_prv_msg" add column "text_updated_at3" timestamptz(0) null default null;'
        );

        this.addSql(
            'alter table "room_pub_msg" add column "text_updated_at3" timestamptz(0) null default null;'
        );
    }

    async down(): Promise<void> {
        this.addSql('alter table "room_prv_msg" drop column "text_updated_at3";');

        this.addSql('alter table "room_pub_msg" drop column "text_updated_at3";');
    }
}
