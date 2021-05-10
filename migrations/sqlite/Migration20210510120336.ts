import { Migration } from '@mikro-orm/migrations';

export class Migration20210510120336 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `room_prv_msg` add column `text_source` varchar null default \'\';');
    this.addSql('alter table `room_prv_msg` add column `updated_text` varchar null;');

    this.addSql('alter table `room_pub_msg` add column `text_source` varchar null default \'\';');
    this.addSql('alter table `room_pub_msg` add column `updated_text` varchar null;');
  }

}
