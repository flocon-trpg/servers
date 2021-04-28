import { Migration } from '@mikro-orm/migrations';

export class Migration20210428213817 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "my_value_log" add column "is_value_private_changed" bool not null default false;');
    this.addSql('alter table "my_value_log" drop constraint if exists "my_value_log_my_value_type_check";');
    this.addSql('alter table "my_value_log" alter column "my_value_type" type text using ("my_value_type"::text);');
    this.addSql('alter table "my_value_log" add constraint "my_value_log_my_value_type_check" check ("my_value_type" in (\'Num\'));');
  }

}
