import { Migration } from '@mikro-orm/migrations';

export class Migration20210316052320 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `room_prv_msg` add column `chara_is_private` integer null default null;');
    this.addSql('alter table `room_prv_msg` add column `chara_image_path` varchar null default null;');
    this.addSql('alter table `room_prv_msg` add column `chara_image_source_type` text check (`chara_image_source_type` in (\'Default\', \'FirebaseStorage\')) null default null;');
    this.addSql('alter table `room_prv_msg` add column `chara_tachie_image_path` varchar null default null;');
    this.addSql('alter table `room_prv_msg` add column `chara_tachie_image_source_type` text check (`chara_tachie_image_source_type` in (\'Default\', \'FirebaseStorage\')) null default null;');

    this.addSql('alter table `room_pub_msg` add column `chara_is_private` integer null default null;');
    this.addSql('alter table `room_pub_msg` add column `chara_image_path` varchar null default null;');
    this.addSql('alter table `room_pub_msg` add column `chara_image_source_type` text check (`chara_image_source_type` in (\'Default\', \'FirebaseStorage\')) null default null;');
    this.addSql('alter table `room_pub_msg` add column `chara_tachie_image_path` varchar null default null;');
    this.addSql('alter table `room_pub_msg` add column `chara_tachie_image_source_type` text check (`chara_tachie_image_source_type` in (\'Default\', \'FirebaseStorage\')) null default null;');
  }

}
