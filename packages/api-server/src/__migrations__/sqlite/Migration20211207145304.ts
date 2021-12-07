import { Migration } from '@mikro-orm/migrations';

export class Migration20211207145304 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table `room_op` add column `created_at` datetime null default null;');
        this.addSql('create index `room_op_created_at_index` on `room_op` (`created_at`);');
    }
}
