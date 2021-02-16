import { Migration } from '@mikro-orm/migrations';

export class Migration20210216101602 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `user` (`user_uid` varchar not null, `is_entry` integer not null, primary key (`user_uid`));');

    this.addSql('create table `room` (`id` varchar not null, `version` integer not null default 1, `updated_at` datetime null, `join_as_player_phrase` varchar null, `join_as_spectator_phrase` varchar null, `delete_phrase` varchar null, `room_revision` integer not null, `name` varchar not null, `partici_revision` integer not null, primary key (`id`));');

    this.addSql('create table `room_op` (`id` varchar not null, `prev_revision` integer not null, `name` varchar null, primary key (`id`));');

    this.addSql('create table `room_prv_msg` (`id` varchar not null, `version` integer not null default 1, `created_at` datetime not null, `updated_at` datetime null, `text` varchar null, `text_color` varchar null, `command_result` varchar null, `alt_text_to_secret` varchar null, `is_secret` integer not null, `chara_state_id` varchar null, `chara_name` varchar null, `custom_name` varchar null, primary key (`id`));');

    this.addSql('create table `user_visible_room_prv_msgs` (`user_user_uid` varchar not null, `room_prv_msg_id` varchar not null, primary key (`user_user_uid`, `room_prv_msg_id`));');
    this.addSql('create index `user_visible_room_prv_msgs_user_user_uid_index` on `user_visible_room_prv_msgs` (`user_user_uid`);');
    this.addSql('create index `user_visible_room_prv_msgs_room_prv_msg_id_index` on `user_visible_room_prv_msgs` (`room_prv_msg_id`);');

    this.addSql('create table `room_pub_ch` (`id` varchar not null, `version` integer not null default 1, `updated_at` datetime null, `key` varchar not null, `name` varchar null, primary key (`id`));');

    this.addSql('create table `room_pub_msg` (`id` varchar not null, `version` integer not null default 1, `created_at` datetime not null, `updated_at` datetime null, `text` varchar null, `text_color` varchar null, `command_result` varchar null, `alt_text_to_secret` varchar null, `is_secret` integer not null, `chara_state_id` varchar null, `chara_name` varchar null, `custom_name` varchar null, primary key (`id`));');

    this.addSql('create table `room_se` (`id` varchar not null, `created_at` datetime not null, `file_path` varchar not null, `file_source_type` text check (`file_source_type` in (\'Default\', \'FirebaseStorage\')) not null, `volume` integer not null, primary key (`id`));');

    this.addSql('create table `update_room_bgm_op` (`id` varchar not null, `channel_key` varchar not null, `files` json null, `volume` integer null, primary key (`id`));');
    this.addSql('create index `update_room_bgm_op_channel_key_index` on `update_room_bgm_op` (`channel_key`);');

    this.addSql('create table `remove_room_bgm_op` (`id` varchar not null, `version` integer not null default 1, `channel_key` varchar not null, `files` json not null, `volume` integer not null, primary key (`id`));');
    this.addSql('create index `remove_room_bgm_op_channel_key_index` on `remove_room_bgm_op` (`channel_key`);');

    this.addSql('create table `add_room_bgm_op` (`id` varchar not null, `channel_key` varchar not null, primary key (`id`));');
    this.addSql('create index `add_room_bgm_op_channel_key_index` on `add_room_bgm_op` (`channel_key`);');

    this.addSql('create table `room_bgm` (`id` varchar not null, `channel_key` varchar not null, `files` json not null, `volume` integer not null, `version` integer not null default 1, primary key (`id`));');
    this.addSql('create index `room_bgm_channel_key_index` on `room_bgm` (`channel_key`);');

    this.addSql('create table `room_bgm_base` (`id` varchar not null, `version` integer not null default 1, `channel_key` varchar not null, `files` json not null, `volume` integer not null, primary key (`id`));');
    this.addSql('create index `room_bgm_base_channel_key_index` on `room_bgm_base` (`channel_key`);');

    this.addSql('create table `update_param_name_op` (`id` varchar not null, `type` text check (`type` in (\'Str\', \'Num\', \'Bool\')) not null, `key` varchar not null, `name` varchar null, primary key (`id`));');
    this.addSql('create index `update_param_name_op_type_index` on `update_param_name_op` (`type`);');
    this.addSql('create index `update_param_name_op_key_index` on `update_param_name_op` (`key`);');

    this.addSql('create table `remove_param_name_op` (`id` varchar not null, `key` varchar not null, `type` text check (`type` in (\'Str\', \'Num\', \'Bool\')) not null, `name` varchar not null, primary key (`id`));');
    this.addSql('create index `remove_param_name_op_key_index` on `remove_param_name_op` (`key`);');
    this.addSql('create index `remove_param_name_op_type_index` on `remove_param_name_op` (`type`);');

    this.addSql('create table `add_param_name_op` (`id` varchar not null, `type` text check (`type` in (\'Str\', \'Num\', \'Bool\')) not null, `key` varchar not null, primary key (`id`));');
    this.addSql('create index `add_param_name_op_type_index` on `add_param_name_op` (`type`);');
    this.addSql('create index `add_param_name_op_key_index` on `add_param_name_op` (`key`);');

    this.addSql('create table `param_name` (`id` varchar not null, `key` varchar not null, `type` text check (`type` in (\'Str\', \'Num\', \'Bool\')) not null, `name` varchar not null, `version` integer not null default 1, primary key (`id`));');
    this.addSql('create index `param_name_key_index` on `param_name` (`key`);');
    this.addSql('create index `param_name_type_index` on `param_name` (`type`);');

    this.addSql('create table `partici_op` (`id` varchar not null, `prev_revision` integer not null, primary key (`id`));');

    this.addSql('create table `add_partici_op` (`id` varchar not null, primary key (`id`));');

    this.addSql('create table `update_partici_op` (`id` varchar not null, `name` varchar null, `role` text check (`role` in (\'Player\', \'Spectator\', \'Master\', \'Left\')) null, primary key (`id`));');

    this.addSql('create table `partici` (`id` varchar not null, `version` integer not null default 1, `name` varchar not null, `role` text check (`role` in (\'Player\', \'Spectator\', \'Master\')) null, primary key (`id`));');

    this.addSql('create table `update_chara_op` (`id` varchar not null, `created_by` varchar not null, `state_id` varchar not null, `is_private` integer null, `name` varchar null, `image` json null, primary key (`id`));');
    this.addSql('create index `update_chara_op_created_by_index` on `update_chara_op` (`created_by`);');
    this.addSql('create index `update_chara_op_state_id_index` on `update_chara_op` (`state_id`);');

    this.addSql('create table `update_bool_param_op` (`id` varchar not null, `key` varchar not null, `is_value_private` integer null, `value` json null, primary key (`id`));');
    this.addSql('create index `update_bool_param_op_key_index` on `update_bool_param_op` (`key`);');

    this.addSql('create table `add_num_param_op` (`id` varchar not null, `key` varchar not null, primary key (`id`));');
    this.addSql('create index `add_num_param_op_key_index` on `add_num_param_op` (`key`);');

    this.addSql('create table `update_num_param_op` (`id` varchar not null, `key` varchar not null, `is_value_private` integer null, `value` json null, primary key (`id`));');
    this.addSql('create index `update_num_param_op_key_index` on `update_num_param_op` (`key`);');

    this.addSql('create table `update_num_max_param_op` (`id` varchar not null, `key` varchar not null, `is_value_private` integer null, `value` json null, primary key (`id`));');
    this.addSql('create index `update_num_max_param_op_key_index` on `update_num_max_param_op` (`key`);');

    this.addSql('create table `update_str_param_op` (`id` varchar not null, `key` varchar not null, `is_value_private` integer null, `value` json null, primary key (`id`));');
    this.addSql('create index `update_str_param_op_key_index` on `update_str_param_op` (`key`);');

    this.addSql('create table `add_piece_loc_op` (`id` varchar not null, `board_id` varchar not null, `board_created_by` varchar not null, primary key (`id`));');
    this.addSql('create index `add_piece_loc_op_board_id_index` on `add_piece_loc_op` (`board_id`);');
    this.addSql('create index `add_piece_loc_op_board_created_by_index` on `add_piece_loc_op` (`board_created_by`);');

    this.addSql('create table `remove_piece_loc_op` (`id` varchar not null, `board_id` varchar not null, `board_created_by` varchar not null, `is_private` integer not null, `is_cell_mode` integer not null, `x` integer not null, `y` integer not null, `w` integer not null, `h` integer not null, `cell_x` integer not null, `cell_y` integer not null, `cell_w` integer not null, `cell_h` integer not null, primary key (`id`));');
    this.addSql('create index `remove_piece_loc_op_board_id_index` on `remove_piece_loc_op` (`board_id`);');
    this.addSql('create index `remove_piece_loc_op_board_created_by_index` on `remove_piece_loc_op` (`board_created_by`);');

    this.addSql('create table `update_piece_loc_op` (`id` varchar not null, `board_id` varchar not null, `board_created_by` varchar not null, `is_private` integer null, `is_cell_mode` integer null, `x` integer null, `y` integer null, `w` integer null, `h` integer null, `cell_x` integer null, `cell_y` integer null, `cell_w` integer null, `cell_h` integer null, primary key (`id`));');
    this.addSql('create index `update_piece_loc_op_board_id_index` on `update_piece_loc_op` (`board_id`);');
    this.addSql('create index `update_piece_loc_op_board_created_by_index` on `update_piece_loc_op` (`board_created_by`);');

    this.addSql('create table `remove_chara_op` (`id` varchar not null, `created_by` varchar not null, `state_id` varchar not null, `is_private` integer not null, `name` varchar not null, `image_path` varchar null, `image_source_type` text check (`image_source_type` in (\'Default\', \'FirebaseStorage\')) null, primary key (`id`));');
    this.addSql('create index `remove_chara_op_created_by_index` on `remove_chara_op` (`created_by`);');
    this.addSql('create index `remove_chara_op_state_id_index` on `remove_chara_op` (`state_id`);');

    this.addSql('create table `removed_bool_param` (`id` varchar not null, `key` varchar not null, `is_value_private` integer not null, `value` integer null, `version` integer not null default 1, primary key (`id`));');
    this.addSql('create index `removed_bool_param_key_index` on `removed_bool_param` (`key`);');

    this.addSql('create table `removed_num_param` (`id` varchar not null, `key` varchar not null, `is_value_private` integer not null, `value` integer null, `version` integer not null default 1, primary key (`id`));');
    this.addSql('create index `removed_num_param_key_index` on `removed_num_param` (`key`);');

    this.addSql('create table `removed_num_max_param` (`id` varchar not null, `key` varchar not null, `is_value_private` integer not null, `value` integer null, `version` integer not null default 1, primary key (`id`));');
    this.addSql('create index `removed_num_max_param_key_index` on `removed_num_max_param` (`key`);');

    this.addSql('create table `removed_str_param` (`id` varchar not null, `key` varchar not null, `is_value_private` integer not null, `value` varchar not null, `version` integer not null default 1, primary key (`id`));');
    this.addSql('create index `removed_str_param_key_index` on `removed_str_param` (`key`);');

    this.addSql('create table `removed_piece_loc` (`id` varchar not null, `board_id` varchar not null, `board_created_by` varchar not null, `is_private` integer not null, `is_cell_mode` integer not null, `x` integer not null, `y` integer not null, `w` integer not null, `h` integer not null, `cell_x` integer not null, `cell_y` integer not null, `cell_w` integer not null, `cell_h` integer not null, `version` integer not null default 1, primary key (`id`));');
    this.addSql('create index `removed_piece_loc_board_id_index` on `removed_piece_loc` (`board_id`);');
    this.addSql('create index `removed_piece_loc_board_created_by_index` on `removed_piece_loc` (`board_created_by`);');

    this.addSql('create table `add_chara_op` (`id` varchar not null, `created_by` varchar not null, `state_id` varchar not null, primary key (`id`));');
    this.addSql('create index `add_chara_op_created_by_index` on `add_chara_op` (`created_by`);');
    this.addSql('create index `add_chara_op_state_id_index` on `add_chara_op` (`state_id`);');

    this.addSql('create table `chara` (`id` varchar not null, `created_by` varchar not null, `state_id` varchar not null, `is_private` integer not null, `name` varchar not null, `image_path` varchar null, `image_source_type` text check (`image_source_type` in (\'Default\', \'FirebaseStorage\')) null, `version` integer not null default 1, primary key (`id`));');
    this.addSql('create index `chara_created_by_index` on `chara` (`created_by`);');
    this.addSql('create index `chara_state_id_index` on `chara` (`state_id`);');

    this.addSql('create table `bool_param` (`id` varchar not null, `key` varchar not null, `is_value_private` integer not null, `value` integer null, `version` integer not null default 1, primary key (`id`));');
    this.addSql('create index `bool_param_key_index` on `bool_param` (`key`);');

    this.addSql('create table `num_param` (`id` varchar not null, `key` varchar not null, `is_value_private` integer not null, `value` integer null, `version` integer not null default 1, primary key (`id`));');
    this.addSql('create index `num_param_key_index` on `num_param` (`key`);');

    this.addSql('create table `num_max_param` (`id` varchar not null, `key` varchar not null, `is_value_private` integer not null, `value` integer null, `version` integer not null default 1, primary key (`id`));');
    this.addSql('create index `num_max_param_key_index` on `num_max_param` (`key`);');

    this.addSql('create table `str_param` (`id` varchar not null, `key` varchar not null, `is_value_private` integer not null, `value` varchar not null, `version` integer not null default 1, primary key (`id`));');
    this.addSql('create index `str_param_key_index` on `str_param` (`key`);');

    this.addSql('create table `piece_loc` (`id` varchar not null, `board_id` varchar not null, `board_created_by` varchar not null, `is_private` integer not null, `is_cell_mode` integer not null, `x` integer not null, `y` integer not null, `w` integer not null, `h` integer not null, `cell_x` integer not null, `cell_y` integer not null, `cell_w` integer not null, `cell_h` integer not null, `version` integer not null default 1, primary key (`id`));');
    this.addSql('create index `piece_loc_board_id_index` on `piece_loc` (`board_id`);');
    this.addSql('create index `piece_loc_board_created_by_index` on `piece_loc` (`board_created_by`);');

    this.addSql('create table `update_board_op` (`id` varchar not null, `created_by` varchar not null, `state_id` varchar not null, `name` varchar null, `cell_width` integer null, `cell_height` integer null, `cell_row_count` integer null, `cell_column_count` integer null, `cell_offset_x` integer null, `cell_offset_y` integer null, `background_image` json null, `background_image_zoom` integer null, primary key (`id`));');
    this.addSql('create index `update_board_op_created_by_index` on `update_board_op` (`created_by`);');
    this.addSql('create index `update_board_op_state_id_index` on `update_board_op` (`state_id`);');

    this.addSql('create table `remove_board_op` (`id` varchar not null, `created_by` varchar not null, `state_id` varchar not null, `name` varchar not null, `cell_width` integer not null, `cell_height` integer not null, `cell_row_count` integer not null, `cell_column_count` integer not null, `cell_offset_x` integer not null, `cell_offset_y` integer not null, `background_image_path` varchar null, `background_image_source_type` text check (`background_image_source_type` in (\'Default\', \'FirebaseStorage\')) null, `background_image_zoom` integer not null, primary key (`id`));');
    this.addSql('create index `remove_board_op_created_by_index` on `remove_board_op` (`created_by`);');
    this.addSql('create index `remove_board_op_state_id_index` on `remove_board_op` (`state_id`);');

    this.addSql('create table `add_board_op` (`id` varchar not null, `created_by` varchar not null, `state_id` varchar not null, primary key (`id`));');
    this.addSql('create index `add_board_op_created_by_index` on `add_board_op` (`created_by`);');
    this.addSql('create index `add_board_op_state_id_index` on `add_board_op` (`state_id`);');

    this.addSql('create table `board` (`id` varchar not null, `created_by` varchar not null, `state_id` varchar not null, `name` varchar not null, `cell_width` integer not null, `cell_height` integer not null, `cell_row_count` integer not null, `cell_column_count` integer not null, `cell_offset_x` integer not null, `cell_offset_y` integer not null, `background_image_path` varchar null, `background_image_source_type` text check (`background_image_source_type` in (\'Default\', \'FirebaseStorage\')) null, `background_image_zoom` integer not null, `version` integer not null default 1, primary key (`id`));');
    this.addSql('create index `board_created_by_index` on `board` (`created_by`);');
    this.addSql('create index `board_state_id_index` on `board` (`state_id`);');

    this.addSql('alter table `room_op` add column `room_id` varchar null;');
    this.addSql('create index `room_op_room_id_index` on `room_op` (`room_id`);');

    this.addSql('alter table `room_prv_msg` add column `created_by_user_uid` varchar null;');
    this.addSql('alter table `room_prv_msg` add column `room_id` varchar null;');
    this.addSql('create index `room_prv_msg_created_by_user_uid_index` on `room_prv_msg` (`created_by_user_uid`);');
    this.addSql('create index `room_prv_msg_room_id_index` on `room_prv_msg` (`room_id`);');

    this.addSql('alter table `room_pub_ch` add column `room_id` varchar null;');
    this.addSql('create index `room_pub_ch_room_id_index` on `room_pub_ch` (`room_id`);');

    this.addSql('alter table `room_pub_msg` add column `room_pub_ch_id` varchar null;');
    this.addSql('alter table `room_pub_msg` add column `created_by_user_uid` varchar null;');
    this.addSql('create index `room_pub_msg_room_pub_ch_id_index` on `room_pub_msg` (`room_pub_ch_id`);');
    this.addSql('create index `room_pub_msg_created_by_user_uid_index` on `room_pub_msg` (`created_by_user_uid`);');

    this.addSql('alter table `room_se` add column `created_by_user_uid` varchar null;');
    this.addSql('alter table `room_se` add column `room_id` varchar null;');
    this.addSql('create index `room_se_created_by_user_uid_index` on `room_se` (`created_by_user_uid`);');
    this.addSql('create index `room_se_room_id_index` on `room_se` (`room_id`);');

    this.addSql('alter table `update_room_bgm_op` add column `room_op_id` varchar null;');
    this.addSql('create index `update_room_bgm_op_room_op_id_index` on `update_room_bgm_op` (`room_op_id`);');

    this.addSql('alter table `remove_room_bgm_op` add column `room_id` varchar null;');
    this.addSql('alter table `remove_room_bgm_op` add column `room_op_id` varchar null;');
    this.addSql('create index `remove_room_bgm_op_room_id_index` on `remove_room_bgm_op` (`room_id`);');
    this.addSql('create index `remove_room_bgm_op_room_op_id_index` on `remove_room_bgm_op` (`room_op_id`);');

    this.addSql('alter table `add_room_bgm_op` add column `room_op_id` varchar null;');
    this.addSql('create index `add_room_bgm_op_room_op_id_index` on `add_room_bgm_op` (`room_op_id`);');

    this.addSql('alter table `room_bgm` add column `room_id` varchar null;');
    this.addSql('create index `room_bgm_room_id_index` on `room_bgm` (`room_id`);');

    this.addSql('alter table `room_bgm_base` add column `room_id` varchar null;');
    this.addSql('create index `room_bgm_base_room_id_index` on `room_bgm_base` (`room_id`);');

    this.addSql('alter table `update_param_name_op` add column `room_op_id` varchar null;');
    this.addSql('create index `update_param_name_op_room_op_id_index` on `update_param_name_op` (`room_op_id`);');

    this.addSql('alter table `remove_param_name_op` add column `room_op_id` varchar null;');
    this.addSql('create index `remove_param_name_op_room_op_id_index` on `remove_param_name_op` (`room_op_id`);');

    this.addSql('alter table `add_param_name_op` add column `room_op_id` varchar null;');
    this.addSql('create index `add_param_name_op_room_op_id_index` on `add_param_name_op` (`room_op_id`);');

    this.addSql('alter table `param_name` add column `room_id` varchar null;');
    this.addSql('create index `param_name_room_id_index` on `param_name` (`room_id`);');

    this.addSql('alter table `partici_op` add column `room_id` varchar null;');
    this.addSql('create index `partici_op_room_id_index` on `partici_op` (`room_id`);');

    this.addSql('alter table `add_partici_op` add column `user_user_uid` varchar null;');
    this.addSql('alter table `add_partici_op` add column `partici_op_id` varchar null;');
    this.addSql('create index `add_partici_op_user_user_uid_index` on `add_partici_op` (`user_user_uid`);');
    this.addSql('create index `add_partici_op_partici_op_id_index` on `add_partici_op` (`partici_op_id`);');

    this.addSql('alter table `update_partici_op` add column `user_user_uid` varchar null;');
    this.addSql('alter table `update_partici_op` add column `partici_op_id` varchar null;');
    this.addSql('create index `update_partici_op_user_user_uid_index` on `update_partici_op` (`user_user_uid`);');
    this.addSql('create index `update_partici_op_partici_op_id_index` on `update_partici_op` (`partici_op_id`);');

    this.addSql('alter table `partici` add column `user_user_uid` varchar null;');
    this.addSql('alter table `partici` add column `room_id` varchar null;');
    this.addSql('create index `partici_user_user_uid_index` on `partici` (`user_user_uid`);');
    this.addSql('create index `partici_room_id_index` on `partici` (`room_id`);');

    this.addSql('alter table `update_chara_op` add column `room_op_id` varchar null;');
    this.addSql('create index `update_chara_op_room_op_id_index` on `update_chara_op` (`room_op_id`);');

    this.addSql('alter table `update_bool_param_op` add column `update_chara_op_id` varchar null;');
    this.addSql('create index `update_bool_param_op_update_chara_op_id_index` on `update_bool_param_op` (`update_chara_op_id`);');

    this.addSql('alter table `add_num_param_op` add column `update_chara_op_id` varchar null;');
    this.addSql('create index `add_num_param_op_update_chara_op_id_index` on `add_num_param_op` (`update_chara_op_id`);');

    this.addSql('alter table `update_num_param_op` add column `update_chara_op_id` varchar null;');
    this.addSql('create index `update_num_param_op_update_chara_op_id_index` on `update_num_param_op` (`update_chara_op_id`);');

    this.addSql('alter table `update_num_max_param_op` add column `update_chara_op_id` varchar null;');
    this.addSql('create index `update_num_max_param_op_update_chara_op_id_index` on `update_num_max_param_op` (`update_chara_op_id`);');

    this.addSql('alter table `update_str_param_op` add column `update_chara_op_id` varchar null;');
    this.addSql('create index `update_str_param_op_update_chara_op_id_index` on `update_str_param_op` (`update_chara_op_id`);');

    this.addSql('alter table `add_piece_loc_op` add column `update_chara_op_id` varchar null;');
    this.addSql('create index `add_piece_loc_op_update_chara_op_id_index` on `add_piece_loc_op` (`update_chara_op_id`);');

    this.addSql('alter table `remove_piece_loc_op` add column `update_chara_op_id` varchar null;');
    this.addSql('create index `remove_piece_loc_op_update_chara_op_id_index` on `remove_piece_loc_op` (`update_chara_op_id`);');

    this.addSql('alter table `update_piece_loc_op` add column `update_chara_op_id` varchar null;');
    this.addSql('create index `update_piece_loc_op_update_chara_op_id_index` on `update_piece_loc_op` (`update_chara_op_id`);');

    this.addSql('alter table `remove_chara_op` add column `room_op_id` varchar null;');
    this.addSql('create index `remove_chara_op_room_op_id_index` on `remove_chara_op` (`room_op_id`);');

    this.addSql('alter table `removed_bool_param` add column `remove_chara_op_id` varchar null;');
    this.addSql('create index `removed_bool_param_remove_chara_op_id_index` on `removed_bool_param` (`remove_chara_op_id`);');

    this.addSql('alter table `removed_num_param` add column `remove_chara_op_id` varchar null;');
    this.addSql('create index `removed_num_param_remove_chara_op_id_index` on `removed_num_param` (`remove_chara_op_id`);');

    this.addSql('alter table `removed_num_max_param` add column `remove_chara_op_id` varchar null;');
    this.addSql('create index `removed_num_max_param_remove_chara_op_id_index` on `removed_num_max_param` (`remove_chara_op_id`);');

    this.addSql('alter table `removed_str_param` add column `remove_chara_op_id` varchar null;');
    this.addSql('create index `removed_str_param_remove_chara_op_id_index` on `removed_str_param` (`remove_chara_op_id`);');

    this.addSql('alter table `removed_piece_loc` add column `remove_chara_op_id` varchar null;');
    this.addSql('create index `removed_piece_loc_remove_chara_op_id_index` on `removed_piece_loc` (`remove_chara_op_id`);');

    this.addSql('alter table `add_chara_op` add column `room_op_id` varchar null;');
    this.addSql('create index `add_chara_op_room_op_id_index` on `add_chara_op` (`room_op_id`);');

    this.addSql('alter table `chara` add column `room_id` varchar null;');
    this.addSql('create index `chara_room_id_index` on `chara` (`room_id`);');

    this.addSql('alter table `bool_param` add column `chara_id` varchar null;');
    this.addSql('create index `bool_param_chara_id_index` on `bool_param` (`chara_id`);');

    this.addSql('alter table `num_param` add column `chara_id` varchar null;');
    this.addSql('create index `num_param_chara_id_index` on `num_param` (`chara_id`);');

    this.addSql('alter table `num_max_param` add column `chara_id` varchar null;');
    this.addSql('create index `num_max_param_chara_id_index` on `num_max_param` (`chara_id`);');

    this.addSql('alter table `str_param` add column `chara_id` varchar null;');
    this.addSql('create index `str_param_chara_id_index` on `str_param` (`chara_id`);');

    this.addSql('alter table `piece_loc` add column `chara_id` varchar null;');
    this.addSql('create index `piece_loc_chara_id_index` on `piece_loc` (`chara_id`);');

    this.addSql('alter table `update_board_op` add column `room_op_id` varchar null;');
    this.addSql('create index `update_board_op_room_op_id_index` on `update_board_op` (`room_op_id`);');

    this.addSql('alter table `remove_board_op` add column `room_op_id` varchar null;');
    this.addSql('create index `remove_board_op_room_op_id_index` on `remove_board_op` (`room_op_id`);');

    this.addSql('alter table `add_board_op` add column `room_op_id` varchar null;');
    this.addSql('create index `add_board_op_room_op_id_index` on `add_board_op` (`room_op_id`);');

    this.addSql('alter table `board` add column `room_id` varchar null;');
    this.addSql('create index `board_room_id_index` on `board` (`room_id`);');

    this.addSql('create unique index `room_op_prev_revision_room_id_unique` on `room_op` (`prev_revision`, `room_id`);');

    this.addSql('create unique index `room_pub_ch_room_id_key_unique` on `room_pub_ch` (`room_id`, `key`);');

    this.addSql('create unique index `update_room_bgm_op_room_op_id_channel_key_unique` on `update_room_bgm_op` (`room_op_id`, `channel_key`);');

    this.addSql('create unique index `remove_room_bgm_op_room_op_id_channel_key_unique` on `remove_room_bgm_op` (`room_op_id`, `channel_key`);');

    this.addSql('create unique index `add_room_bgm_op_room_op_id_channel_key_unique` on `add_room_bgm_op` (`room_op_id`, `channel_key`);');

    this.addSql('create unique index `room_bgm_room_id_channel_key_unique` on `room_bgm` (`room_id`, `channel_key`);');

    this.addSql('create unique index `update_param_name_op_room_op_id_type_key_unique` on `update_param_name_op` (`room_op_id`, `type`, `key`);');

    this.addSql('create unique index `remove_param_name_op_room_op_id_type_key_unique` on `remove_param_name_op` (`room_op_id`, `type`, `key`);');

    this.addSql('create unique index `add_param_name_op_room_op_id_type_key_unique` on `add_param_name_op` (`room_op_id`, `type`, `key`);');

    this.addSql('create unique index `param_name_room_id_type_key_unique` on `param_name` (`room_id`, `type`, `key`);');

    this.addSql('create unique index `partici_op_prev_revision_room_id_unique` on `partici_op` (`prev_revision`, `room_id`);');

    this.addSql('create unique index `add_partici_op_partici_op_id_user_user_uid_unique` on `add_partici_op` (`partici_op_id`, `user_user_uid`);');

    this.addSql('create unique index `update_partici_op_partici_op_id_user_user_uid_unique` on `update_partici_op` (`partici_op_id`, `user_user_uid`);');

    this.addSql('create unique index `partici_user_user_uid_room_id_unique` on `partici` (`user_user_uid`, `room_id`);');

    this.addSql('create unique index `update_bool_param_op_update_chara_op_id_key_unique` on `update_bool_param_op` (`update_chara_op_id`, `key`);');

    this.addSql('create unique index `add_num_param_op_update_chara_op_id_key_unique` on `add_num_param_op` (`update_chara_op_id`, `key`);');

    this.addSql('create unique index `update_num_param_op_update_chara_op_id_key_unique` on `update_num_param_op` (`update_chara_op_id`, `key`);');

    this.addSql('create unique index `update_num_max_param_op_update_chara_op_id_key_unique` on `update_num_max_param_op` (`update_chara_op_id`, `key`);');

    this.addSql('create unique index `update_str_param_op_update_chara_op_id_key_unique` on `update_str_param_op` (`update_chara_op_id`, `key`);');

    this.addSql('create unique index `removed_bool_param_remove_chara_op_id_key_unique` on `removed_bool_param` (`remove_chara_op_id`, `key`);');

    this.addSql('create unique index `removed_num_param_remove_chara_op_id_key_unique` on `removed_num_param` (`remove_chara_op_id`, `key`);');

    this.addSql('create unique index `removed_num_max_param_remove_chara_op_id_key_unique` on `removed_num_max_param` (`remove_chara_op_id`, `key`);');

    this.addSql('create unique index `removed_str_param_remove_chara_op_id_key_unique` on `removed_str_param` (`remove_chara_op_id`, `key`);');

    this.addSql('create unique index `chara_created_by_state_id_unique` on `chara` (`created_by`, `state_id`);');

    this.addSql('create unique index `bool_param_chara_id_key_unique` on `bool_param` (`chara_id`, `key`);');

    this.addSql('create unique index `num_param_chara_id_key_unique` on `num_param` (`chara_id`, `key`);');

    this.addSql('create unique index `num_max_param_chara_id_key_unique` on `num_max_param` (`chara_id`, `key`);');

    this.addSql('create unique index `str_param_chara_id_key_unique` on `str_param` (`chara_id`, `key`);');

    this.addSql('create unique index `update_board_op_room_op_id_created_by_state_id_unique` on `update_board_op` (`room_op_id`, `created_by`, `state_id`);');

    this.addSql('create unique index `remove_board_op_room_op_id_created_by_state_id_unique` on `remove_board_op` (`room_op_id`, `created_by`, `state_id`);');

    this.addSql('create unique index `add_board_op_room_op_id_created_by_state_id_unique` on `add_board_op` (`room_op_id`, `created_by`, `state_id`);');

    this.addSql('create unique index `board_created_by_state_id_unique` on `board` (`created_by`, `state_id`);');
  }

}
