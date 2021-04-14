import { Migration } from '@mikro-orm/migrations';

export class Migration20210409152358 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `room` add column `public_channel1name` varchar null default \'\';');
    this.addSql('alter table `room` add column `public_channel2name` varchar null default \'\';');
    this.addSql('alter table `room` add column `public_channel3name` varchar null default \'\';');
    this.addSql('alter table `room` add column `public_channel4name` varchar null default \'\';');
    this.addSql('alter table `room` add column `public_channel5name` varchar null default \'\';');
    this.addSql('alter table `room` add column `public_channel6name` varchar null default \'\';');
    this.addSql('alter table `room` add column `public_channel7name` varchar null default \'\';');
    this.addSql('alter table `room` add column `public_channel8name` varchar null default \'\';');
    this.addSql('alter table `room` add column `public_channel9name` varchar null default \'\';');
    this.addSql('alter table `room` add column `public_channel10name` varchar null default \'\';');

    this.addSql('alter table `room_op` add column `public_channel1name` varchar null;');
    this.addSql('alter table `room_op` add column `public_channel2name` varchar null;');
    this.addSql('alter table `room_op` add column `public_channel3name` varchar null;');
    this.addSql('alter table `room_op` add column `public_channel4name` varchar null;');
    this.addSql('alter table `room_op` add column `public_channel5name` varchar null;');
    this.addSql('alter table `room_op` add column `public_channel6name` varchar null;');
    this.addSql('alter table `room_op` add column `public_channel7name` varchar null;');
    this.addSql('alter table `room_op` add column `public_channel8name` varchar null;');
    this.addSql('alter table `room_op` add column `public_channel9name` varchar null;');
    this.addSql('alter table `room_op` add column `public_channel10name` varchar null;');
  }

}
