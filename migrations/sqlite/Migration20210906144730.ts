import { Migration } from '@mikro-orm/migrations';

export class Migration20210906144730 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table `room` add column `created_at` datetime null;');
        this.addSql('create index `room_created_at_index` on `room` (`created_at`);');
    }
}
