import { Migration } from '@mikro-orm/migrations';

export class Migration20220727114405 extends Migration {
    async up(): Promise<void> {
        this.addSql('drop index "file_screenname_index";');
        this.addSql(
            'alter table "file" alter column "screenname" type text using ("screenname"::text);'
        );
        this.addSql('alter table "file" alter column "screenname" drop not null;');
    }

    async down(): Promise<void> {
        this.addSql(
            'alter table "file" alter column "screenname" type varchar(255) using ("screenname"::varchar(255));'
        );
        this.addSql('alter table "file" alter column "screenname" set not null;');
        this.addSql('create index "file_screenname_index" on "file" ("screenname");');
    }
}
