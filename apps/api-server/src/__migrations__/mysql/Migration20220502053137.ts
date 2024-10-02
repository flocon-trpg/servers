import { Migration } from '@mikro-orm/migrations';

export class Migration20220502053137 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table `room` add `complete_updated_at` datetime null;');
        this.addSql(
            'alter table `room` add index `room_complete_updated_at_index`(`complete_updated_at`);',
        );
    }

    async down(): Promise<void> {
        this.addSql('alter table `room` drop index `room_complete_updated_at_index`;');
        this.addSql('alter table `room` drop `complete_updated_at`;');
    }
}
