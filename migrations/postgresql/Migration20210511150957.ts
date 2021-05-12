import { Migration } from '@mikro-orm/migrations';

export class Migration20210511150957 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "my_value_log" drop constraint if exists "my_value_log_my_value_type_check";');
    this.addSql('alter table "my_value_log" alter column "my_value_type" type text using ("my_value_type"::text);');
    this.addSql('alter table "my_value_log" add constraint "my_value_log_my_value_type_check" check ("my_value_type" in (\'Num\'));');

    this.addSql('alter table "update_chara_op" add column "private_var_toml" varchar(255) null;');

    this.addSql('alter table "remove_chara_op" drop constraint if exists "remove_chara_op_private_var_toml_check";');
    this.addSql('alter table "remove_chara_op" alter column "private_var_toml" type varchar(65536) using ("private_var_toml"::varchar(65536));');
    this.addSql('alter table "remove_chara_op" alter column "private_var_toml" set default \'\';');

    this.addSql('alter table "chara" drop constraint if exists "chara_private_var_toml_check";');
    this.addSql('alter table "chara" alter column "private_var_toml" type varchar(65536) using ("private_var_toml"::varchar(65536));');
    this.addSql('alter table "chara" alter column "private_var_toml" set default \'\';');
  }

}
