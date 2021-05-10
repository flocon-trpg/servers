import { Migration } from '@mikro-orm/migrations';

export class Migration20210510120409 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "room_prv_msg" add column "text_source" varchar(65535) null default \'\', add column "updated_text" varchar(65535) null;');
    this.addSql('alter table "room_prv_msg" drop constraint if exists "room_prv_msg_text_check";');
    this.addSql('alter table "room_prv_msg" alter column "text" type varchar(65535) using ("text"::varchar(65535));');
    this.addSql('alter table "room_prv_msg" alter column "text" set default \'\';');
    this.addSql('alter table "room_prv_msg" alter column "text" set not null;');

    this.addSql('alter table "room_pub_msg" add column "text_source" varchar(65535) null default \'\', add column "updated_text" varchar(65535) null;');
    this.addSql('alter table "room_pub_msg" drop constraint if exists "room_pub_msg_text_check";');
    this.addSql('alter table "room_pub_msg" alter column "text" type varchar(65535) using ("text"::varchar(65535));');
    this.addSql('alter table "room_pub_msg" alter column "text" set default \'\';');
    this.addSql('alter table "room_pub_msg" alter column "text" set not null;');

    this.addSql('alter table "my_value_log" drop constraint if exists "my_value_log_my_value_type_check";');
    this.addSql('alter table "my_value_log" alter column "my_value_type" type text using ("my_value_type"::text);');
    this.addSql('alter table "my_value_log" add constraint "my_value_log_my_value_type_check" check ("my_value_type" in (\'Num\'));');
  }

}
