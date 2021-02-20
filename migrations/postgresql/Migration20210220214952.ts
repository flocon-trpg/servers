import { Migration } from '@mikro-orm/migrations';

export class Migration20210220214952 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "room_prv_msg" add column "command_is_success" bool null default null;');

    this.addSql('alter table "room_pub_msg" add column "command_is_success" bool null default null;');
  }

}
