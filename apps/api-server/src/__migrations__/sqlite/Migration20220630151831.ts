import { Migration } from '@mikro-orm/migrations';

export class Migration20220630151831 extends Migration {
    async up(): Promise<void> {
        this.addSql(
            'alter table `room_prv_msg` add column `text_updated_at3` datetime null default null;'
        );

        this.addSql(
            'alter table `room_pub_msg` add column `text_updated_at3` datetime null default null;'
        );
    }
}
