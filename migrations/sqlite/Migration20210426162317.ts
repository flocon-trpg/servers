import { Migration } from '@mikro-orm/migrations';

export class Migration20210426162317 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `my_value_log` (`id` varchar not null, `created_at` datetime not null, `state_id` varchar not null, `my_value_type` text check (`my_value_type` in (\'Num\')) not null, `value_changed` integer not null, `replace_type` integer null, `created_pieces` json not null, `deleted_pieces` json not null, `moved_pieces` json not null, `resized_pieces` json not null, primary key (`id`));');

    this.addSql('alter table `my_value_log` add column `created_by_id` varchar null;');
    this.addSql('create index `my_value_log_created_by_id_index` on `my_value_log` (`created_by_id`);');
  }

}
