import { Migration } from '@mikro-orm/migrations';

export class Migration20210218195434 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `room_prv_msg` add column `text_updated_at` integer null default null;');

    this.addSql('alter table `room_pub_msg` add column `text_updated_at` integer null default null;');
  }

}
