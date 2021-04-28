import { Migration } from '@mikro-orm/migrations';

export class Migration20210428213728 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `my_value_log` add column `is_value_private_changed` integer null default false;');
  }

}
