import { Migration } from '@mikro-orm/migrations';

export class Migration20220427150340 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table `room_prv_msg` add `text_updated_at2` date null default null;');

        this.addSql('alter table `room_pub_msg` add `text_updated_at2` date null default null;');
    }

    async down(): Promise<void> {
        this.addSql('alter table `room_prv_msg` drop `text_updated_at2`;');

        this.addSql('alter table `room_pub_msg` drop `text_updated_at2`;');
    }
}
