import { Migration } from '@mikro-orm/migrations';

export class Migration20220630151845 extends Migration {
    async up(): Promise<void> {
        this.addSql(
            'alter table `room_prv_msg` add `text_updated_at3` datetime null default null;'
        );

        this.addSql(
            'alter table `room_pub_msg` add `text_updated_at3` datetime null default null;'
        );
    }

    async down(): Promise<void> {
        this.addSql('alter table `room_prv_msg` drop `text_updated_at3`;');

        this.addSql('alter table `room_pub_msg` drop `text_updated_at3`;');
    }
}
