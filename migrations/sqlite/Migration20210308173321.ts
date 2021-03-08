import { Migration } from '@mikro-orm/migrations';

export class Migration20210308173321 extends Migration {

  async up(): Promise<void> {
    this.addSql('drop index `removed_my_value_piece_by_partici_board_id_board_created_by_removed_my_value_id_unique`;');

    this.addSql('create unique index `removed_my_value_piece_by_partici_unique` on `removed_my_value_piece_by_partici` (`board_id`, `board_created_by`, `removed_my_value_id`);');

    this.addSql('drop index `removed_my_value_piece_by_my_value_board_id_board_created_by_remove_my_value_op_id_unique`;');

    this.addSql('create unique index `removed_my_value_piece_by_my_value_unique` on `removed_my_value_piece_by_my_value` (`board_id`, `board_created_by`, `remove_my_value_op_id`);');

    this.addSql('drop index `add_my_value_piece_op_board_id_board_created_by_update_my_value_op_id_unique`;');

    this.addSql('create unique index `add_my_value_piece_op_unique` on `add_my_value_piece_op` (`board_id`, `board_created_by`, `update_my_value_op_id`);');

    this.addSql('drop index `remove_my_value_piece_op_board_id_board_created_by_update_my_value_op_id_unique`;');

    this.addSql('create unique index `remove_my_value_piece_op_unique` on `remove_my_value_piece_op` (`board_id`, `board_created_by`, `update_my_value_op_id`);');

    this.addSql('drop index `update_my_value_piece_op_board_id_board_created_by_update_my_value_op_id_unique`;');

    this.addSql('create unique index `update_my_value_piece_op_unique` on `update_my_value_piece_op` (`board_id`, `board_created_by`, `update_my_value_op_id`);');

    this.addSql('drop index `my_value_piece_my_value_id_board_id_board_created_by_unique`;');

    this.addSql('create unique index `my_value_piece_unique` on `my_value_piece` (`my_value_id`, `board_id`, `board_created_by`);');

    this.addSql('drop index `update_chara_op_room_op_id_created_by_state_id_unique`;');

    this.addSql('create unique index `update_chara_op_unique` on `update_chara_op` (`room_op_id`, `created_by`, `state_id`);');

    this.addSql('drop index `add_chara_piece_op_update_chara_op_id_board_created_by_board_id_unique`;');

    this.addSql('create unique index `add_chara_piece_op_unique` on `add_chara_piece_op` (`update_chara_op_id`, `board_created_by`, `board_id`);');

    this.addSql('drop index `remove_chara_piece_op_update_chara_op_id_board_created_by_board_id_unique`;');

    this.addSql('create unique index `remove_chara_piece_op_unique` on `remove_chara_piece_op` (`update_chara_op_id`, `board_created_by`, `board_id`);');

    this.addSql('drop index `update_chara_piece_op_update_chara_op_id_board_created_by_board_id_unique`;');

    this.addSql('create unique index `update_chara_piece_op_unique` on `update_chara_piece_op` (`update_chara_op_id`, `board_created_by`, `board_id`);');

    this.addSql('drop index `add_tachie_loc_op_update_chara_op_id_board_created_by_board_id_unique`;');

    this.addSql('create unique index `add_tachie_loc_op_unique` on `add_tachie_loc_op` (`update_chara_op_id`, `board_created_by`, `board_id`);');

    this.addSql('drop index `remove_tachie_loc_op_update_chara_op_id_board_created_by_board_id_unique`;');

    this.addSql('create unique index `remove_tachie_loc_op_unique` on `remove_tachie_loc_op` (`update_chara_op_id`, `board_created_by`, `board_id`);');

    this.addSql('drop index `update_tachie_loc_op_update_chara_op_id_board_created_by_board_id_unique`;');

    this.addSql('create unique index `update_tachie_loc_op_unique` on `update_tachie_loc_op` (`update_chara_op_id`, `board_created_by`, `board_id`);');

    this.addSql('drop index `remove_chara_op_room_op_id_created_by_state_id_unique`;');

    this.addSql('create unique index `remove_chara_op_unique` on `remove_chara_op` (`room_op_id`, `created_by`, `state_id`);');

    this.addSql('drop index `removed_chara_piece_remove_chara_op_id_board_created_by_board_id_unique`;');

    this.addSql('create unique index `removed_chara_piece_unique` on `removed_chara_piece` (`remove_chara_op_id`, `board_created_by`, `board_id`);');

    this.addSql('drop index `removed_tachie_loc_remove_chara_op_id_board_created_by_board_id_unique`;');

    this.addSql('create unique index `removed_tachie_loc_unique` on `removed_tachie_loc` (`remove_chara_op_id`, `board_created_by`, `board_id`);');

    this.addSql('drop index `add_chara_op_room_op_id_created_by_state_id_unique`;');

    this.addSql('create unique index `add_chara_op_unique` on `add_chara_op` (`room_op_id`, `created_by`, `state_id`);');

    this.addSql('drop index `chara_piece_chara_id_board_created_by_board_id_unique`;');

    this.addSql('create unique index `chara_piece_unique` on `chara_piece` (`chara_id`, `board_created_by`, `board_id`);');

    this.addSql('drop index `tachie_loc_chara_id_board_created_by_board_id_unique`;');

    this.addSql('create unique index `tachie_loc_unique` on `tachie_loc` (`chara_id`, `board_created_by`, `board_id`);');

    this.addSql('drop index `update_board_op_room_op_id_created_by_state_id_unique`;');

    this.addSql('create unique index `update_board_op_unique` on `update_board_op` (`room_op_id`, `created_by`, `state_id`);');

    this.addSql('drop index `remove_board_op_room_op_id_created_by_state_id_unique`;');

    this.addSql('create unique index `remove_board_op_unique` on `remove_board_op` (`room_op_id`, `created_by`, `state_id`);');

    this.addSql('drop index `add_board_op_room_op_id_created_by_state_id_unique`;');

    this.addSql('create unique index `add_board_op_unique` on `add_board_op` (`room_op_id`, `created_by`, `state_id`);');
  }

}
