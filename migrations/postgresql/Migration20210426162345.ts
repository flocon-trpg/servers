import { Migration } from '@mikro-orm/migrations';

export class Migration20210426162345 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "my_value_log" ("id" varchar(255) not null, "created_at" timestamptz(0) not null, "state_id" varchar(255) not null, "my_value_type" text check ("my_value_type" in (\'Num\')) not null, "value_changed" bool not null, "replace_type" bool null, "created_pieces" jsonb not null, "deleted_pieces" jsonb not null, "moved_pieces" jsonb not null, "resized_pieces" jsonb not null, "created_by_id" varchar(255) not null);');
    this.addSql('alter table "my_value_log" add constraint "my_value_log_pkey" primary key ("id");');

    this.addSql('alter table "my_value_log" add constraint "my_value_log_created_by_id_foreign" foreign key ("created_by_id") references "partici" ("id") on update cascade;');
  }

}
