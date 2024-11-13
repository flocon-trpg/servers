import { Migration } from '@mikro-orm/migrations';

export class Migration20220502053022 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table `room` add column `complete_updated_at` datetime null;');
        this.addSql(
            'create index `room_complete_updated_at_index` on `room` (`complete_updated_at`);',
        );
    }
}
