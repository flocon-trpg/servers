import { Migration } from '@mikro-orm/migrations';

export class Migration20210928142207 extends Migration {
    async up(): Promise<void> {
        this.addSql(
            'create table `string_piece_value_log` (`id` varchar not null, `character_created_by` varchar not null, `character_id` varchar not null, `created_at` datetime not null, `state_id` varchar not null, `value` json null, primary key (`id`));'
        );
        this.addSql(
            'create index `string_piece_value_log_character_created_by_index` on `string_piece_value_log` (`character_created_by`);'
        );
        this.addSql(
            'create index `string_piece_value_log_character_id_index` on `string_piece_value_log` (`character_id`);'
        );
        this.addSql(
            'create index `string_piece_value_log_state_id_index` on `string_piece_value_log` (`state_id`);'
        );

        this.addSql('alter table `string_piece_value_log` add column `room_id` varchar null;');
        this.addSql(
            'create index `string_piece_value_log_room_id_index` on `string_piece_value_log` (`room_id`);'
        );

        this.addSql('drop table if exists `number_piece_value_log`;');
    }
}
