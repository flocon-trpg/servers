import { Migration } from '@mikro-orm/migrations';

export class Migration20220727114555 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table `file` drop index `file_screenname_index`;');
        this.addSql('alter table `file` modify `screenname` text null;');
    }

    async down(): Promise<void> {
        this.addSql('alter table `file` modify `screenname` varchar(255) not null;');
        this.addSql('alter table `file` add index `file_screenname_index`(`screenname`);');
    }
}
