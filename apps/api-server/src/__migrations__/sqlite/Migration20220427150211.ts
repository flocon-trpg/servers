import { Migration } from '@mikro-orm/migrations';

export class Migration20220427150211 extends Migration {
    async up(): Promise<void> {
        this.addSql(
            'alter table `room_prv_msg` add column `text_updated_at2` date null default null;',
        );

        this.addSql(
            'alter table `room_pub_msg` add column `text_updated_at2` date null default null;',
        );
    }
}
