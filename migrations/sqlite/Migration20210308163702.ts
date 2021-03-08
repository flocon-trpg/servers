import { Migration } from '@mikro-orm/migrations';

export class Migration20210308163702 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `update_chara_op` add column `tachie_image` json null;');

    this.addSql('create table `add_tachie_loc_op` (`id` varchar not null, `board_id` varchar not null, `board_created_by` varchar not null, primary key (`id`));');
    this.addSql('create index `add_tachie_loc_op_board_id_index` on `add_tachie_loc_op` (`board_id`);');
    this.addSql('create index `add_tachie_loc_op_board_created_by_index` on `add_tachie_loc_op` (`board_created_by`);');

    this.addSql('create table `remove_tachie_loc_op` (`id` varchar not null, `board_id` varchar not null, `board_created_by` varchar not null, `is_private` integer not null, `x` integer not null, `y` integer not null, `w` integer not null, `h` integer not null, primary key (`id`));');
    this.addSql('create index `remove_tachie_loc_op_board_id_index` on `remove_tachie_loc_op` (`board_id`);');
    this.addSql('create index `remove_tachie_loc_op_board_created_by_index` on `remove_tachie_loc_op` (`board_created_by`);');

    this.addSql('create table `update_tachie_loc_op` (`id` varchar not null, `board_id` varchar not null, `board_created_by` varchar not null, `is_private` integer null, `x` integer null, `y` integer null, `w` integer null, `h` integer null, primary key (`id`));');
    this.addSql('create index `update_tachie_loc_op_board_id_index` on `update_tachie_loc_op` (`board_id`);');
    this.addSql('create index `update_tachie_loc_op_board_created_by_index` on `update_tachie_loc_op` (`board_created_by`);');

    this.addSql('alter table `remove_chara_op` add column `tachie_image_path` varchar null default null;');
    this.addSql('alter table `remove_chara_op` add column `tachie_image_source_type` text check (`tachie_image_source_type` in (\'Default\', \'FirebaseStorage\')) null default null;');

    this.addSql('create table `removed_tachie_loc` (`id` varchar not null, `board_id` varchar not null, `board_created_by` varchar not null, `is_private` integer not null, `x` integer not null, `y` integer not null, `w` integer not null, `h` integer not null, `version` integer not null default 1, primary key (`id`));');
    this.addSql('create index `removed_tachie_loc_board_id_index` on `removed_tachie_loc` (`board_id`);');
    this.addSql('create index `removed_tachie_loc_board_created_by_index` on `removed_tachie_loc` (`board_created_by`);');

    this.addSql('alter table `chara` add column `tachie_image_path` varchar null default null;');
    this.addSql('alter table `chara` add column `tachie_image_source_type` text check (`tachie_image_source_type` in (\'Default\', \'FirebaseStorage\')) null default null;');

    this.addSql('create table `tachie_loc` (`id` varchar not null, `board_id` varchar not null, `board_created_by` varchar not null, `is_private` integer not null, `x` integer not null, `y` integer not null, `w` integer not null, `h` integer not null, `version` integer not null default 1, primary key (`id`));');
    this.addSql('create index `tachie_loc_board_id_index` on `tachie_loc` (`board_id`);');
    this.addSql('create index `tachie_loc_board_created_by_index` on `tachie_loc` (`board_created_by`);');

    this.addSql('alter table `add_tachie_loc_op` add column `update_chara_op_id` varchar null;');
    this.addSql('create index `add_tachie_loc_op_update_chara_op_id_index` on `add_tachie_loc_op` (`update_chara_op_id`);');

    this.addSql('alter table `remove_tachie_loc_op` add column `update_chara_op_id` varchar null;');
    this.addSql('create index `remove_tachie_loc_op_update_chara_op_id_index` on `remove_tachie_loc_op` (`update_chara_op_id`);');

    this.addSql('alter table `update_tachie_loc_op` add column `update_chara_op_id` varchar null;');
    this.addSql('create index `update_tachie_loc_op_update_chara_op_id_index` on `update_tachie_loc_op` (`update_chara_op_id`);');

    this.addSql('alter table `removed_tachie_loc` add column `remove_chara_op_id` varchar null;');
    this.addSql('create index `removed_tachie_loc_remove_chara_op_id_index` on `removed_tachie_loc` (`remove_chara_op_id`);');

    this.addSql('alter table `tachie_loc` add column `chara_id` varchar null;');
    this.addSql('create index `tachie_loc_chara_id_index` on `tachie_loc` (`chara_id`);');

    this.addSql('create unique index `add_tachie_loc_op_update_chara_op_id_board_created_by_board_id_unique` on `add_tachie_loc_op` (`update_chara_op_id`, `board_created_by`, `board_id`);');

    this.addSql('create unique index `remove_tachie_loc_op_update_chara_op_id_board_created_by_board_id_unique` on `remove_tachie_loc_op` (`update_chara_op_id`, `board_created_by`, `board_id`);');

    this.addSql('create unique index `update_tachie_loc_op_update_chara_op_id_board_created_by_board_id_unique` on `update_tachie_loc_op` (`update_chara_op_id`, `board_created_by`, `board_id`);');

    this.addSql('create unique index `removed_tachie_loc_remove_chara_op_id_board_created_by_board_id_unique` on `removed_tachie_loc` (`remove_chara_op_id`, `board_created_by`, `board_id`);');

    this.addSql('create unique index `tachie_loc_chara_id_board_created_by_board_id_unique` on `tachie_loc` (`chara_id`, `board_created_by`, `board_id`);');
  }

}
