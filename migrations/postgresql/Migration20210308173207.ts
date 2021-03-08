import { Migration } from '@mikro-orm/migrations';

export class Migration20210308173207 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user" ("user_uid" varchar(255) not null, "is_entry" bool not null);');
    this.addSql('alter table "user" add constraint "user_pkey" primary key ("user_uid");');

    this.addSql('create table "room" ("id" varchar(255) not null, "version" int4 not null default 1, "updated_at" timestamptz(0) null, "join_as_player_phrase" varchar(255) null, "join_as_spectator_phrase" varchar(255) null, "created_by" varchar(255) not null, "revision" int4 not null, "name" varchar(255) not null);');
    this.addSql('alter table "room" add constraint "room_pkey" primary key ("id");');

    this.addSql('create table "room_op" ("id" varchar(255) not null, "prev_revision" int4 not null, "name" varchar(255) null, "room_id" varchar(255) not null);');
    this.addSql('alter table "room_op" add constraint "room_op_pkey" primary key ("id");');

    this.addSql('create table "room_prv_msg" ("id" varchar(255) not null, "version" int4 not null default 1, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) null, "text" varchar(65535) null, "text_updated_at" int4 null default null, "text_color" varchar(255) null, "command_result" varchar(65535) null, "command_is_success" bool null default null, "alt_text_to_secret" varchar(65535) null, "is_secret" bool not null, "chara_state_id" varchar(255) null, "chara_name" varchar(255) null, "custom_name" varchar(255) null, "created_by_user_uid" varchar(255) null, "room_id" varchar(255) not null);');
    this.addSql('alter table "room_prv_msg" add constraint "room_prv_msg_pkey" primary key ("id");');

    this.addSql('create table "user_visible_room_prv_msgs" ("user_user_uid" varchar(255) not null, "room_prv_msg_id" varchar(255) not null);');
    this.addSql('alter table "user_visible_room_prv_msgs" add constraint "user_visible_room_prv_msgs_pkey" primary key ("user_user_uid", "room_prv_msg_id");');

    this.addSql('create table "room_pub_ch" ("id" varchar(255) not null, "version" int4 not null default 1, "updated_at" timestamptz(0) null, "key" varchar(255) not null, "name" varchar(255) null, "room_id" varchar(255) not null);');
    this.addSql('alter table "room_pub_ch" add constraint "room_pub_ch_pkey" primary key ("id");');

    this.addSql('create table "room_pub_msg" ("id" varchar(255) not null, "version" int4 not null default 1, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) null, "text" varchar(65535) null, "text_updated_at" int4 null default null, "text_color" varchar(255) null, "command_result" varchar(65535) null, "command_is_success" bool null default null, "alt_text_to_secret" varchar(65535) null, "is_secret" bool not null, "chara_state_id" varchar(255) null, "chara_name" varchar(255) null, "custom_name" varchar(255) null, "room_pub_ch_id" varchar(255) not null, "created_by_user_uid" varchar(255) null);');
    this.addSql('alter table "room_pub_msg" add constraint "room_pub_msg_pkey" primary key ("id");');

    this.addSql('create table "room_se" ("id" varchar(255) not null, "created_at" timestamptz(0) not null, "file_path" varchar(255) not null, "file_source_type" text check ("file_source_type" in (\'Default\', \'FirebaseStorage\')) not null, "volume" int4 not null, "created_by_user_uid" varchar(255) null, "room_id" varchar(255) not null);');
    this.addSql('alter table "room_se" add constraint "room_se_pkey" primary key ("id");');

    this.addSql('create table "update_room_bgm_op" ("id" varchar(255) not null, "channel_key" varchar(255) not null, "files" jsonb null, "volume" int4 null, "room_op_id" varchar(255) not null);');
    this.addSql('alter table "update_room_bgm_op" add constraint "update_room_bgm_op_pkey" primary key ("id");');
    this.addSql('create index "update_room_bgm_op_channel_key_index" on "update_room_bgm_op" ("channel_key");');

    this.addSql('create table "remove_room_bgm_op" ("id" varchar(255) not null, "version" int4 not null default 1, "channel_key" varchar(255) not null, "files" jsonb not null, "volume" int4 not null, "room_op_id" varchar(255) not null);');
    this.addSql('alter table "remove_room_bgm_op" add constraint "remove_room_bgm_op_pkey" primary key ("id");');
    this.addSql('create index "remove_room_bgm_op_channel_key_index" on "remove_room_bgm_op" ("channel_key");');

    this.addSql('create table "add_room_bgm_op" ("id" varchar(255) not null, "channel_key" varchar(255) not null, "room_op_id" varchar(255) not null);');
    this.addSql('alter table "add_room_bgm_op" add constraint "add_room_bgm_op_pkey" primary key ("id");');
    this.addSql('create index "add_room_bgm_op_channel_key_index" on "add_room_bgm_op" ("channel_key");');

    this.addSql('create table "room_bgm" ("id" varchar(255) not null, "channel_key" varchar(255) not null, "files" jsonb not null, "volume" int4 not null, "version" int4 not null default 1, "room_id" varchar(255) not null);');
    this.addSql('alter table "room_bgm" add constraint "room_bgm_pkey" primary key ("id");');
    this.addSql('create index "room_bgm_channel_key_index" on "room_bgm" ("channel_key");');

    this.addSql('create table "room_bgm_base" ("id" varchar(255) not null, "version" int4 not null default 1, "channel_key" varchar(255) not null, "files" jsonb not null, "volume" int4 not null);');
    this.addSql('alter table "room_bgm_base" add constraint "room_bgm_base_pkey" primary key ("id");');
    this.addSql('create index "room_bgm_base_channel_key_index" on "room_bgm_base" ("channel_key");');

    this.addSql('create table "update_param_name_op" ("id" varchar(255) not null, "type" text check ("type" in (\'Str\', \'Num\', \'Bool\')) not null, "key" varchar(255) not null, "name" varchar(255) null, "room_op_id" varchar(255) not null);');
    this.addSql('alter table "update_param_name_op" add constraint "update_param_name_op_pkey" primary key ("id");');
    this.addSql('create index "update_param_name_op_type_index" on "update_param_name_op" ("type");');
    this.addSql('create index "update_param_name_op_key_index" on "update_param_name_op" ("key");');

    this.addSql('create table "remove_param_name_op" ("id" varchar(255) not null, "key" varchar(255) not null, "type" text check ("type" in (\'Str\', \'Num\', \'Bool\')) not null, "name" varchar(255) not null, "room_op_id" varchar(255) not null);');
    this.addSql('alter table "remove_param_name_op" add constraint "remove_param_name_op_pkey" primary key ("id");');
    this.addSql('create index "remove_param_name_op_key_index" on "remove_param_name_op" ("key");');
    this.addSql('create index "remove_param_name_op_type_index" on "remove_param_name_op" ("type");');

    this.addSql('create table "add_param_name_op" ("id" varchar(255) not null, "type" text check ("type" in (\'Str\', \'Num\', \'Bool\')) not null, "key" varchar(255) not null, "room_op_id" varchar(255) not null);');
    this.addSql('alter table "add_param_name_op" add constraint "add_param_name_op_pkey" primary key ("id");');
    this.addSql('create index "add_param_name_op_type_index" on "add_param_name_op" ("type");');
    this.addSql('create index "add_param_name_op_key_index" on "add_param_name_op" ("key");');

    this.addSql('create table "param_name" ("id" varchar(255) not null, "key" varchar(255) not null, "type" text check ("type" in (\'Str\', \'Num\', \'Bool\')) not null, "name" varchar(255) not null, "version" int4 not null default 1, "room_id" varchar(255) not null);');
    this.addSql('alter table "param_name" add constraint "param_name_pkey" primary key ("id");');
    this.addSql('create index "param_name_key_index" on "param_name" ("key");');
    this.addSql('create index "param_name_type_index" on "param_name" ("type");');

    this.addSql('create table "remove_partici_op" ("id" varchar(255) not null, "version" int4 not null default 1, "name" varchar(255) not null, "role" text check ("role" in (\'Player\', \'Spectator\', \'Master\')) null, "user_user_uid" varchar(255) not null, "room_op_id" varchar(255) not null);');
    this.addSql('alter table "remove_partici_op" add constraint "remove_partici_op_pkey" primary key ("id");');

    this.addSql('create table "removed_my_value" ("id" varchar(255) not null, "state_id" varchar(255) not null, "value" jsonb not null, "remove_partici_op_id" varchar(255) not null);');
    this.addSql('alter table "removed_my_value" add constraint "removed_my_value_pkey" primary key ("id");');
    this.addSql('create index "removed_my_value_state_id_index" on "removed_my_value" ("state_id");');

    this.addSql('create table "removed_my_value_piece_by_partici" ("id" varchar(255) not null, "board_id" varchar(255) not null, "board_created_by" varchar(255) not null, "is_private" bool not null, "is_cell_mode" bool not null, "x" int4 not null, "y" int4 not null, "w" int4 not null, "h" int4 not null, "cell_x" int4 not null, "cell_y" int4 not null, "cell_w" int4 not null, "cell_h" int4 not null, "version" int4 not null default 1, "removed_my_value_id" varchar(255) not null);');
    this.addSql('alter table "removed_my_value_piece_by_partici" add constraint "removed_my_value_piece_by_partici_pkey" primary key ("id");');
    this.addSql('create index "removed_my_value_piece_by_partici_board_id_index" on "removed_my_value_piece_by_partici" ("board_id");');
    this.addSql('create index "removed_my_value_piece_by_partici_board_created_by_index" on "removed_my_value_piece_by_partici" ("board_created_by");');

    this.addSql('create table "update_partici_op" ("id" varchar(255) not null, "name" varchar(255) null, "role" text check ("role" in (\'Player\', \'Spectator\', \'Master\', \'Left\')) null, "user_user_uid" varchar(255) not null, "room_op_id" varchar(255) not null);');
    this.addSql('alter table "update_partici_op" add constraint "update_partici_op_pkey" primary key ("id");');

    this.addSql('create table "add_my_value_op" ("id" varchar(255) not null, "state_id" varchar(255) not null, "update_partici_op_id" varchar(255) not null);');
    this.addSql('alter table "add_my_value_op" add constraint "add_my_value_op_pkey" primary key ("id");');
    this.addSql('create index "add_my_value_op_state_id_index" on "add_my_value_op" ("state_id");');

    this.addSql('create table "remove_my_value_op" ("id" varchar(255) not null, "state_id" varchar(255) not null, "value" jsonb not null, "update_partici_op_id" varchar(255) not null);');
    this.addSql('alter table "remove_my_value_op" add constraint "remove_my_value_op_pkey" primary key ("id");');
    this.addSql('create index "remove_my_value_op_state_id_index" on "remove_my_value_op" ("state_id");');

    this.addSql('create table "removed_my_value_piece_by_my_value" ("id" varchar(255) not null, "board_id" varchar(255) not null, "board_created_by" varchar(255) not null, "is_private" bool not null, "is_cell_mode" bool not null, "x" int4 not null, "y" int4 not null, "w" int4 not null, "h" int4 not null, "cell_x" int4 not null, "cell_y" int4 not null, "cell_w" int4 not null, "cell_h" int4 not null, "version" int4 not null default 1, "remove_my_value_op_id" varchar(255) not null);');
    this.addSql('alter table "removed_my_value_piece_by_my_value" add constraint "removed_my_value_piece_by_my_value_pkey" primary key ("id");');
    this.addSql('create index "removed_my_value_piece_by_my_value_board_id_index" on "removed_my_value_piece_by_my_value" ("board_id");');
    this.addSql('create index "removed_my_value_piece_by_my_value_board_created_by_index" on "removed_my_value_piece_by_my_value" ("board_created_by");');

    this.addSql('create table "update_my_value_op" ("id" varchar(255) not null, "state_id" varchar(255) not null, "value" jsonb not null, "update_partici_op_id" varchar(255) not null);');
    this.addSql('alter table "update_my_value_op" add constraint "update_my_value_op_pkey" primary key ("id");');
    this.addSql('create index "update_my_value_op_state_id_index" on "update_my_value_op" ("state_id");');

    this.addSql('create table "add_my_value_piece_op" ("id" varchar(255) not null, "board_id" varchar(255) not null, "board_created_by" varchar(255) not null, "update_my_value_op_id" varchar(255) not null);');
    this.addSql('alter table "add_my_value_piece_op" add constraint "add_my_value_piece_op_pkey" primary key ("id");');
    this.addSql('create index "add_my_value_piece_op_board_id_index" on "add_my_value_piece_op" ("board_id");');
    this.addSql('create index "add_my_value_piece_op_board_created_by_index" on "add_my_value_piece_op" ("board_created_by");');

    this.addSql('create table "remove_my_value_piece_op" ("id" varchar(255) not null, "board_id" varchar(255) not null, "board_created_by" varchar(255) not null, "is_private" bool not null, "is_cell_mode" bool not null, "x" int4 not null, "y" int4 not null, "w" int4 not null, "h" int4 not null, "cell_x" int4 not null, "cell_y" int4 not null, "cell_w" int4 not null, "cell_h" int4 not null, "update_my_value_op_id" varchar(255) not null);');
    this.addSql('alter table "remove_my_value_piece_op" add constraint "remove_my_value_piece_op_pkey" primary key ("id");');
    this.addSql('create index "remove_my_value_piece_op_board_id_index" on "remove_my_value_piece_op" ("board_id");');
    this.addSql('create index "remove_my_value_piece_op_board_created_by_index" on "remove_my_value_piece_op" ("board_created_by");');

    this.addSql('create table "update_my_value_piece_op" ("id" varchar(255) not null, "board_id" varchar(255) not null, "board_created_by" varchar(255) not null, "is_private" bool null, "is_cell_mode" bool null, "x" int4 null, "y" int4 null, "w" int4 null, "h" int4 null, "cell_x" int4 null, "cell_y" int4 null, "cell_w" int4 null, "cell_h" int4 null, "update_my_value_op_id" varchar(255) not null);');
    this.addSql('alter table "update_my_value_piece_op" add constraint "update_my_value_piece_op_pkey" primary key ("id");');
    this.addSql('create index "update_my_value_piece_op_board_id_index" on "update_my_value_piece_op" ("board_id");');
    this.addSql('create index "update_my_value_piece_op_board_created_by_index" on "update_my_value_piece_op" ("board_created_by");');

    this.addSql('create table "add_partici_op" ("id" varchar(255) not null, "user_user_uid" varchar(255) not null, "room_op_id" varchar(255) not null);');
    this.addSql('alter table "add_partici_op" add constraint "add_partici_op_pkey" primary key ("id");');

    this.addSql('create table "partici" ("id" varchar(255) not null, "version" int4 not null default 1, "name" varchar(255) not null, "role" text check ("role" in (\'Player\', \'Spectator\', \'Master\')) null, "user_user_uid" varchar(255) not null, "room_id" varchar(255) not null);');
    this.addSql('alter table "partici" add constraint "partici_pkey" primary key ("id");');

    this.addSql('create table "my_value" ("id" varchar(255) not null, "state_id" varchar(255) not null, "value" jsonb not null, "version" int4 not null default 1, "partici_id" varchar(255) not null);');
    this.addSql('alter table "my_value" add constraint "my_value_pkey" primary key ("id");');
    this.addSql('create index "my_value_state_id_index" on "my_value" ("state_id");');

    this.addSql('create table "my_value_piece" ("id" varchar(255) not null, "board_id" varchar(255) not null, "board_created_by" varchar(255) not null, "is_private" bool not null, "is_cell_mode" bool not null, "x" int4 not null, "y" int4 not null, "w" int4 not null, "h" int4 not null, "cell_x" int4 not null, "cell_y" int4 not null, "cell_w" int4 not null, "cell_h" int4 not null, "version" int4 not null default 1, "my_value_id" varchar(255) not null);');
    this.addSql('alter table "my_value_piece" add constraint "my_value_piece_pkey" primary key ("id");');
    this.addSql('create index "my_value_piece_board_id_index" on "my_value_piece" ("board_id");');
    this.addSql('create index "my_value_piece_board_created_by_index" on "my_value_piece" ("board_created_by");');

    this.addSql('create table "update_chara_op" ("id" varchar(255) not null, "created_by" varchar(255) not null, "state_id" varchar(255) not null, "is_private" bool null, "name" varchar(255) null, "image" jsonb null, "tachie_image" jsonb null, "room_op_id" varchar(255) not null);');
    this.addSql('alter table "update_chara_op" add constraint "update_chara_op_pkey" primary key ("id");');
    this.addSql('create index "update_chara_op_created_by_index" on "update_chara_op" ("created_by");');
    this.addSql('create index "update_chara_op_state_id_index" on "update_chara_op" ("state_id");');

    this.addSql('create table "update_bool_param_op" ("id" varchar(255) not null, "key" varchar(255) not null, "is_value_private" bool null, "value" jsonb null, "update_chara_op_id" varchar(255) not null);');
    this.addSql('alter table "update_bool_param_op" add constraint "update_bool_param_op_pkey" primary key ("id");');
    this.addSql('create index "update_bool_param_op_key_index" on "update_bool_param_op" ("key");');

    this.addSql('create table "update_num_param_op" ("id" varchar(255) not null, "key" varchar(255) not null, "is_value_private" bool null, "value" jsonb null, "update_chara_op_id" varchar(255) not null);');
    this.addSql('alter table "update_num_param_op" add constraint "update_num_param_op_pkey" primary key ("id");');
    this.addSql('create index "update_num_param_op_key_index" on "update_num_param_op" ("key");');

    this.addSql('create table "update_num_max_param_op" ("id" varchar(255) not null, "key" varchar(255) not null, "is_value_private" bool null, "value" jsonb null, "update_chara_op_id" varchar(255) not null);');
    this.addSql('alter table "update_num_max_param_op" add constraint "update_num_max_param_op_pkey" primary key ("id");');
    this.addSql('create index "update_num_max_param_op_key_index" on "update_num_max_param_op" ("key");');

    this.addSql('create table "update_str_param_op" ("id" varchar(255) not null, "key" varchar(255) not null, "is_value_private" bool null, "value" jsonb null, "update_chara_op_id" varchar(255) not null);');
    this.addSql('alter table "update_str_param_op" add constraint "update_str_param_op_pkey" primary key ("id");');
    this.addSql('create index "update_str_param_op_key_index" on "update_str_param_op" ("key");');

    this.addSql('create table "add_chara_piece_op" ("id" varchar(255) not null, "board_id" varchar(255) not null, "board_created_by" varchar(255) not null, "update_chara_op_id" varchar(255) not null);');
    this.addSql('alter table "add_chara_piece_op" add constraint "add_chara_piece_op_pkey" primary key ("id");');
    this.addSql('create index "add_chara_piece_op_board_id_index" on "add_chara_piece_op" ("board_id");');
    this.addSql('create index "add_chara_piece_op_board_created_by_index" on "add_chara_piece_op" ("board_created_by");');

    this.addSql('create table "remove_chara_piece_op" ("id" varchar(255) not null, "board_id" varchar(255) not null, "board_created_by" varchar(255) not null, "is_private" bool not null, "is_cell_mode" bool not null, "x" int4 not null, "y" int4 not null, "w" int4 not null, "h" int4 not null, "cell_x" int4 not null, "cell_y" int4 not null, "cell_w" int4 not null, "cell_h" int4 not null, "update_chara_op_id" varchar(255) not null);');
    this.addSql('alter table "remove_chara_piece_op" add constraint "remove_chara_piece_op_pkey" primary key ("id");');
    this.addSql('create index "remove_chara_piece_op_board_id_index" on "remove_chara_piece_op" ("board_id");');
    this.addSql('create index "remove_chara_piece_op_board_created_by_index" on "remove_chara_piece_op" ("board_created_by");');

    this.addSql('create table "update_chara_piece_op" ("id" varchar(255) not null, "board_id" varchar(255) not null, "board_created_by" varchar(255) not null, "is_private" bool null, "is_cell_mode" bool null, "x" int4 null, "y" int4 null, "w" int4 null, "h" int4 null, "cell_x" int4 null, "cell_y" int4 null, "cell_w" int4 null, "cell_h" int4 null, "update_chara_op_id" varchar(255) not null);');
    this.addSql('alter table "update_chara_piece_op" add constraint "update_chara_piece_op_pkey" primary key ("id");');
    this.addSql('create index "update_chara_piece_op_board_id_index" on "update_chara_piece_op" ("board_id");');
    this.addSql('create index "update_chara_piece_op_board_created_by_index" on "update_chara_piece_op" ("board_created_by");');

    this.addSql('create table "add_tachie_loc_op" ("id" varchar(255) not null, "board_id" varchar(255) not null, "board_created_by" varchar(255) not null, "update_chara_op_id" varchar(255) not null);');
    this.addSql('alter table "add_tachie_loc_op" add constraint "add_tachie_loc_op_pkey" primary key ("id");');
    this.addSql('create index "add_tachie_loc_op_board_id_index" on "add_tachie_loc_op" ("board_id");');
    this.addSql('create index "add_tachie_loc_op_board_created_by_index" on "add_tachie_loc_op" ("board_created_by");');

    this.addSql('create table "remove_tachie_loc_op" ("id" varchar(255) not null, "board_id" varchar(255) not null, "board_created_by" varchar(255) not null, "is_private" bool not null, "x" int4 not null, "y" int4 not null, "w" int4 not null, "h" int4 not null, "update_chara_op_id" varchar(255) not null);');
    this.addSql('alter table "remove_tachie_loc_op" add constraint "remove_tachie_loc_op_pkey" primary key ("id");');
    this.addSql('create index "remove_tachie_loc_op_board_id_index" on "remove_tachie_loc_op" ("board_id");');
    this.addSql('create index "remove_tachie_loc_op_board_created_by_index" on "remove_tachie_loc_op" ("board_created_by");');

    this.addSql('create table "update_tachie_loc_op" ("id" varchar(255) not null, "board_id" varchar(255) not null, "board_created_by" varchar(255) not null, "is_private" bool null, "x" int4 null, "y" int4 null, "w" int4 null, "h" int4 null, "update_chara_op_id" varchar(255) not null);');
    this.addSql('alter table "update_tachie_loc_op" add constraint "update_tachie_loc_op_pkey" primary key ("id");');
    this.addSql('create index "update_tachie_loc_op_board_id_index" on "update_tachie_loc_op" ("board_id");');
    this.addSql('create index "update_tachie_loc_op_board_created_by_index" on "update_tachie_loc_op" ("board_created_by");');

    this.addSql('create table "remove_chara_op" ("id" varchar(255) not null, "created_by" varchar(255) not null, "state_id" varchar(255) not null, "is_private" bool not null, "name" varchar(255) not null, "image_path" varchar(65535) null, "image_source_type" text check ("image_source_type" in (\'Default\', \'FirebaseStorage\')) null, "tachie_image_path" varchar(65535) null default null, "tachie_image_source_type" text check ("tachie_image_source_type" in (\'Default\', \'FirebaseStorage\')) null default null, "room_op_id" varchar(255) not null);');
    this.addSql('alter table "remove_chara_op" add constraint "remove_chara_op_pkey" primary key ("id");');
    this.addSql('create index "remove_chara_op_created_by_index" on "remove_chara_op" ("created_by");');
    this.addSql('create index "remove_chara_op_state_id_index" on "remove_chara_op" ("state_id");');

    this.addSql('create table "removed_bool_param" ("id" varchar(255) not null, "key" varchar(255) not null, "is_value_private" bool not null, "value" bool null, "version" int4 not null default 1, "remove_chara_op_id" varchar(255) not null);');
    this.addSql('alter table "removed_bool_param" add constraint "removed_bool_param_pkey" primary key ("id");');
    this.addSql('create index "removed_bool_param_key_index" on "removed_bool_param" ("key");');

    this.addSql('create table "removed_num_param" ("id" varchar(255) not null, "key" varchar(255) not null, "is_value_private" bool not null, "value" int4 null, "version" int4 not null default 1, "remove_chara_op_id" varchar(255) not null);');
    this.addSql('alter table "removed_num_param" add constraint "removed_num_param_pkey" primary key ("id");');
    this.addSql('create index "removed_num_param_key_index" on "removed_num_param" ("key");');

    this.addSql('create table "removed_num_max_param" ("id" varchar(255) not null, "key" varchar(255) not null, "is_value_private" bool not null, "value" int4 null, "version" int4 not null default 1, "remove_chara_op_id" varchar(255) not null);');
    this.addSql('alter table "removed_num_max_param" add constraint "removed_num_max_param_pkey" primary key ("id");');
    this.addSql('create index "removed_num_max_param_key_index" on "removed_num_max_param" ("key");');

    this.addSql('create table "removed_str_param" ("id" varchar(255) not null, "key" varchar(255) not null, "is_value_private" bool not null, "value" varchar(255) not null, "version" int4 not null default 1, "remove_chara_op_id" varchar(255) not null);');
    this.addSql('alter table "removed_str_param" add constraint "removed_str_param_pkey" primary key ("id");');
    this.addSql('create index "removed_str_param_key_index" on "removed_str_param" ("key");');

    this.addSql('create table "removed_chara_piece" ("id" varchar(255) not null, "board_id" varchar(255) not null, "board_created_by" varchar(255) not null, "is_private" bool not null, "is_cell_mode" bool not null, "x" int4 not null, "y" int4 not null, "w" int4 not null, "h" int4 not null, "cell_x" int4 not null, "cell_y" int4 not null, "cell_w" int4 not null, "cell_h" int4 not null, "version" int4 not null default 1, "remove_chara_op_id" varchar(255) not null);');
    this.addSql('alter table "removed_chara_piece" add constraint "removed_chara_piece_pkey" primary key ("id");');
    this.addSql('create index "removed_chara_piece_board_id_index" on "removed_chara_piece" ("board_id");');
    this.addSql('create index "removed_chara_piece_board_created_by_index" on "removed_chara_piece" ("board_created_by");');

    this.addSql('create table "removed_tachie_loc" ("id" varchar(255) not null, "board_id" varchar(255) not null, "board_created_by" varchar(255) not null, "is_private" bool not null, "x" int4 not null, "y" int4 not null, "w" int4 not null, "h" int4 not null, "version" int4 not null default 1, "remove_chara_op_id" varchar(255) not null);');
    this.addSql('alter table "removed_tachie_loc" add constraint "removed_tachie_loc_pkey" primary key ("id");');
    this.addSql('create index "removed_tachie_loc_board_id_index" on "removed_tachie_loc" ("board_id");');
    this.addSql('create index "removed_tachie_loc_board_created_by_index" on "removed_tachie_loc" ("board_created_by");');

    this.addSql('create table "add_chara_op" ("id" varchar(255) not null, "created_by" varchar(255) not null, "state_id" varchar(255) not null, "room_op_id" varchar(255) not null);');
    this.addSql('alter table "add_chara_op" add constraint "add_chara_op_pkey" primary key ("id");');
    this.addSql('create index "add_chara_op_created_by_index" on "add_chara_op" ("created_by");');
    this.addSql('create index "add_chara_op_state_id_index" on "add_chara_op" ("state_id");');

    this.addSql('create table "chara" ("id" varchar(255) not null, "created_by" varchar(255) not null, "state_id" varchar(255) not null, "is_private" bool not null, "name" varchar(255) not null, "image_path" varchar(65535) null, "image_source_type" text check ("image_source_type" in (\'Default\', \'FirebaseStorage\')) null, "tachie_image_path" varchar(65535) null default null, "tachie_image_source_type" text check ("tachie_image_source_type" in (\'Default\', \'FirebaseStorage\')) null default null, "version" int4 not null default 1, "room_id" varchar(255) not null);');
    this.addSql('alter table "chara" add constraint "chara_pkey" primary key ("id");');
    this.addSql('create index "chara_created_by_index" on "chara" ("created_by");');
    this.addSql('create index "chara_state_id_index" on "chara" ("state_id");');

    this.addSql('create table "bool_param" ("id" varchar(255) not null, "key" varchar(255) not null, "is_value_private" bool not null, "value" bool null, "version" int4 not null default 1, "chara_id" varchar(255) not null);');
    this.addSql('alter table "bool_param" add constraint "bool_param_pkey" primary key ("id");');
    this.addSql('create index "bool_param_key_index" on "bool_param" ("key");');

    this.addSql('create table "num_param" ("id" varchar(255) not null, "key" varchar(255) not null, "is_value_private" bool not null, "value" int4 null, "version" int4 not null default 1, "chara_id" varchar(255) not null);');
    this.addSql('alter table "num_param" add constraint "num_param_pkey" primary key ("id");');
    this.addSql('create index "num_param_key_index" on "num_param" ("key");');

    this.addSql('create table "num_max_param" ("id" varchar(255) not null, "key" varchar(255) not null, "is_value_private" bool not null, "value" int4 null, "version" int4 not null default 1, "chara_id" varchar(255) not null);');
    this.addSql('alter table "num_max_param" add constraint "num_max_param_pkey" primary key ("id");');
    this.addSql('create index "num_max_param_key_index" on "num_max_param" ("key");');

    this.addSql('create table "str_param" ("id" varchar(255) not null, "key" varchar(255) not null, "is_value_private" bool not null, "value" varchar(255) not null, "version" int4 not null default 1, "chara_id" varchar(255) not null);');
    this.addSql('alter table "str_param" add constraint "str_param_pkey" primary key ("id");');
    this.addSql('create index "str_param_key_index" on "str_param" ("key");');

    this.addSql('create table "chara_piece" ("id" varchar(255) not null, "board_id" varchar(255) not null, "board_created_by" varchar(255) not null, "is_private" bool not null, "is_cell_mode" bool not null, "x" int4 not null, "y" int4 not null, "w" int4 not null, "h" int4 not null, "cell_x" int4 not null, "cell_y" int4 not null, "cell_w" int4 not null, "cell_h" int4 not null, "version" int4 not null default 1, "chara_id" varchar(255) not null);');
    this.addSql('alter table "chara_piece" add constraint "chara_piece_pkey" primary key ("id");');
    this.addSql('create index "chara_piece_board_id_index" on "chara_piece" ("board_id");');
    this.addSql('create index "chara_piece_board_created_by_index" on "chara_piece" ("board_created_by");');

    this.addSql('create table "tachie_loc" ("id" varchar(255) not null, "board_id" varchar(255) not null, "board_created_by" varchar(255) not null, "is_private" bool not null, "x" int4 not null, "y" int4 not null, "w" int4 not null, "h" int4 not null, "version" int4 not null default 1, "chara_id" varchar(255) not null);');
    this.addSql('alter table "tachie_loc" add constraint "tachie_loc_pkey" primary key ("id");');
    this.addSql('create index "tachie_loc_board_id_index" on "tachie_loc" ("board_id");');
    this.addSql('create index "tachie_loc_board_created_by_index" on "tachie_loc" ("board_created_by");');

    this.addSql('create table "update_board_op" ("id" varchar(255) not null, "created_by" varchar(255) not null, "state_id" varchar(255) not null, "name" varchar(255) null, "cell_width" int4 null, "cell_height" int4 null, "cell_row_count" int4 null, "cell_column_count" int4 null, "cell_offset_x" int4 null, "cell_offset_y" int4 null, "background_image" jsonb null, "background_image_zoom" int4 null, "room_op_id" varchar(255) not null);');
    this.addSql('alter table "update_board_op" add constraint "update_board_op_pkey" primary key ("id");');
    this.addSql('create index "update_board_op_created_by_index" on "update_board_op" ("created_by");');
    this.addSql('create index "update_board_op_state_id_index" on "update_board_op" ("state_id");');

    this.addSql('create table "remove_board_op" ("id" varchar(255) not null, "created_by" varchar(255) not null, "state_id" varchar(255) not null, "name" varchar(255) not null, "cell_width" int4 not null, "cell_height" int4 not null, "cell_row_count" int4 not null, "cell_column_count" int4 not null, "cell_offset_x" int4 not null, "cell_offset_y" int4 not null, "background_image_path" varchar(65535) null, "background_image_source_type" text check ("background_image_source_type" in (\'Default\', \'FirebaseStorage\')) null, "background_image_zoom" int4 not null, "room_op_id" varchar(255) not null);');
    this.addSql('alter table "remove_board_op" add constraint "remove_board_op_pkey" primary key ("id");');
    this.addSql('create index "remove_board_op_created_by_index" on "remove_board_op" ("created_by");');
    this.addSql('create index "remove_board_op_state_id_index" on "remove_board_op" ("state_id");');

    this.addSql('create table "add_board_op" ("id" varchar(255) not null, "created_by" varchar(255) not null, "state_id" varchar(255) not null, "room_op_id" varchar(255) not null);');
    this.addSql('alter table "add_board_op" add constraint "add_board_op_pkey" primary key ("id");');
    this.addSql('create index "add_board_op_created_by_index" on "add_board_op" ("created_by");');
    this.addSql('create index "add_board_op_state_id_index" on "add_board_op" ("state_id");');

    this.addSql('create table "board" ("id" varchar(255) not null, "created_by" varchar(255) not null, "state_id" varchar(255) not null, "name" varchar(255) not null, "cell_width" int4 not null, "cell_height" int4 not null, "cell_row_count" int4 not null, "cell_column_count" int4 not null, "cell_offset_x" int4 not null, "cell_offset_y" int4 not null, "background_image_path" varchar(65535) null, "background_image_source_type" text check ("background_image_source_type" in (\'Default\', \'FirebaseStorage\')) null, "background_image_zoom" int4 not null, "version" int4 not null default 1, "room_id" varchar(255) not null);');
    this.addSql('alter table "board" add constraint "board_pkey" primary key ("id");');
    this.addSql('create index "board_created_by_index" on "board" ("created_by");');
    this.addSql('create index "board_state_id_index" on "board" ("state_id");');

    this.addSql('alter table "room_op" add constraint "room_op_room_id_foreign" foreign key ("room_id") references "room" ("id") on update cascade;');

    this.addSql('alter table "room_prv_msg" add constraint "room_prv_msg_created_by_user_uid_foreign" foreign key ("created_by_user_uid") references "user" ("user_uid") on update cascade on delete set null;');
    this.addSql('alter table "room_prv_msg" add constraint "room_prv_msg_room_id_foreign" foreign key ("room_id") references "room" ("id") on update cascade;');

    this.addSql('alter table "user_visible_room_prv_msgs" add constraint "user_visible_room_prv_msgs_user_user_uid_foreign" foreign key ("user_user_uid") references "user" ("user_uid") on update cascade on delete cascade;');
    this.addSql('alter table "user_visible_room_prv_msgs" add constraint "user_visible_room_prv_msgs_room_prv_msg_id_foreign" foreign key ("room_prv_msg_id") references "room_prv_msg" ("id") on update cascade on delete cascade;');

    this.addSql('alter table "room_pub_ch" add constraint "room_pub_ch_room_id_foreign" foreign key ("room_id") references "room" ("id") on update cascade;');

    this.addSql('alter table "room_pub_msg" add constraint "room_pub_msg_room_pub_ch_id_foreign" foreign key ("room_pub_ch_id") references "room_pub_ch" ("id") on update cascade;');
    this.addSql('alter table "room_pub_msg" add constraint "room_pub_msg_created_by_user_uid_foreign" foreign key ("created_by_user_uid") references "user" ("user_uid") on update cascade on delete set null;');

    this.addSql('alter table "room_se" add constraint "room_se_created_by_user_uid_foreign" foreign key ("created_by_user_uid") references "user" ("user_uid") on update cascade on delete set null;');
    this.addSql('alter table "room_se" add constraint "room_se_room_id_foreign" foreign key ("room_id") references "room" ("id") on update cascade;');

    this.addSql('alter table "update_room_bgm_op" add constraint "update_room_bgm_op_room_op_id_foreign" foreign key ("room_op_id") references "room_op" ("id") on update cascade;');

    this.addSql('alter table "remove_room_bgm_op" add constraint "remove_room_bgm_op_room_op_id_foreign" foreign key ("room_op_id") references "room_op" ("id") on update cascade;');

    this.addSql('alter table "add_room_bgm_op" add constraint "add_room_bgm_op_room_op_id_foreign" foreign key ("room_op_id") references "room_op" ("id") on update cascade;');

    this.addSql('alter table "room_bgm" add constraint "room_bgm_room_id_foreign" foreign key ("room_id") references "room" ("id") on update cascade;');

    this.addSql('alter table "update_param_name_op" add constraint "update_param_name_op_room_op_id_foreign" foreign key ("room_op_id") references "room_op" ("id") on update cascade;');

    this.addSql('alter table "remove_param_name_op" add constraint "remove_param_name_op_room_op_id_foreign" foreign key ("room_op_id") references "room_op" ("id") on update cascade;');

    this.addSql('alter table "add_param_name_op" add constraint "add_param_name_op_room_op_id_foreign" foreign key ("room_op_id") references "room_op" ("id") on update cascade;');

    this.addSql('alter table "param_name" add constraint "param_name_room_id_foreign" foreign key ("room_id") references "room" ("id") on update cascade;');

    this.addSql('alter table "remove_partici_op" add constraint "remove_partici_op_user_user_uid_foreign" foreign key ("user_user_uid") references "user" ("user_uid") on update cascade;');
    this.addSql('alter table "remove_partici_op" add constraint "remove_partici_op_room_op_id_foreign" foreign key ("room_op_id") references "room_op" ("id") on update cascade;');

    this.addSql('alter table "removed_my_value" add constraint "removed_my_value_remove_partici_op_id_foreign" foreign key ("remove_partici_op_id") references "remove_partici_op" ("id") on update cascade;');

    this.addSql('alter table "removed_my_value_piece_by_partici" add constraint "removed_my_value_piece_by_partici_removed_my_value_id_foreign" foreign key ("removed_my_value_id") references "removed_my_value" ("id") on update cascade;');

    this.addSql('alter table "update_partici_op" add constraint "update_partici_op_user_user_uid_foreign" foreign key ("user_user_uid") references "user" ("user_uid") on update cascade;');
    this.addSql('alter table "update_partici_op" add constraint "update_partici_op_room_op_id_foreign" foreign key ("room_op_id") references "room_op" ("id") on update cascade;');

    this.addSql('alter table "add_my_value_op" add constraint "add_my_value_op_update_partici_op_id_foreign" foreign key ("update_partici_op_id") references "update_partici_op" ("id") on update cascade;');

    this.addSql('alter table "remove_my_value_op" add constraint "remove_my_value_op_update_partici_op_id_foreign" foreign key ("update_partici_op_id") references "update_partici_op" ("id") on update cascade;');

    this.addSql('alter table "removed_my_value_piece_by_my_value" add constraint "removed_my_value_piece_by_my_value_remove_my_value_op_id_foreign" foreign key ("remove_my_value_op_id") references "remove_my_value_op" ("id") on update cascade;');

    this.addSql('alter table "update_my_value_op" add constraint "update_my_value_op_update_partici_op_id_foreign" foreign key ("update_partici_op_id") references "update_partici_op" ("id") on update cascade;');

    this.addSql('alter table "add_my_value_piece_op" add constraint "add_my_value_piece_op_update_my_value_op_id_foreign" foreign key ("update_my_value_op_id") references "update_my_value_op" ("id") on update cascade;');

    this.addSql('alter table "remove_my_value_piece_op" add constraint "remove_my_value_piece_op_update_my_value_op_id_foreign" foreign key ("update_my_value_op_id") references "update_my_value_op" ("id") on update cascade;');

    this.addSql('alter table "update_my_value_piece_op" add constraint "update_my_value_piece_op_update_my_value_op_id_foreign" foreign key ("update_my_value_op_id") references "update_my_value_op" ("id") on update cascade;');

    this.addSql('alter table "add_partici_op" add constraint "add_partici_op_user_user_uid_foreign" foreign key ("user_user_uid") references "user" ("user_uid") on update cascade;');
    this.addSql('alter table "add_partici_op" add constraint "add_partici_op_room_op_id_foreign" foreign key ("room_op_id") references "room_op" ("id") on update cascade;');

    this.addSql('alter table "partici" add constraint "partici_user_user_uid_foreign" foreign key ("user_user_uid") references "user" ("user_uid") on update cascade;');
    this.addSql('alter table "partici" add constraint "partici_room_id_foreign" foreign key ("room_id") references "room" ("id") on update cascade;');

    this.addSql('alter table "my_value" add constraint "my_value_partici_id_foreign" foreign key ("partici_id") references "partici" ("id") on update cascade;');

    this.addSql('alter table "my_value_piece" add constraint "my_value_piece_my_value_id_foreign" foreign key ("my_value_id") references "my_value" ("id") on update cascade;');

    this.addSql('alter table "update_chara_op" add constraint "update_chara_op_room_op_id_foreign" foreign key ("room_op_id") references "room_op" ("id") on update cascade;');

    this.addSql('alter table "update_bool_param_op" add constraint "update_bool_param_op_update_chara_op_id_foreign" foreign key ("update_chara_op_id") references "update_chara_op" ("id") on update cascade;');

    this.addSql('alter table "update_num_param_op" add constraint "update_num_param_op_update_chara_op_id_foreign" foreign key ("update_chara_op_id") references "update_chara_op" ("id") on update cascade;');

    this.addSql('alter table "update_num_max_param_op" add constraint "update_num_max_param_op_update_chara_op_id_foreign" foreign key ("update_chara_op_id") references "update_chara_op" ("id") on update cascade;');

    this.addSql('alter table "update_str_param_op" add constraint "update_str_param_op_update_chara_op_id_foreign" foreign key ("update_chara_op_id") references "update_chara_op" ("id") on update cascade;');

    this.addSql('alter table "add_chara_piece_op" add constraint "add_chara_piece_op_update_chara_op_id_foreign" foreign key ("update_chara_op_id") references "update_chara_op" ("id") on update cascade;');

    this.addSql('alter table "remove_chara_piece_op" add constraint "remove_chara_piece_op_update_chara_op_id_foreign" foreign key ("update_chara_op_id") references "update_chara_op" ("id") on update cascade;');

    this.addSql('alter table "update_chara_piece_op" add constraint "update_chara_piece_op_update_chara_op_id_foreign" foreign key ("update_chara_op_id") references "update_chara_op" ("id") on update cascade;');

    this.addSql('alter table "add_tachie_loc_op" add constraint "add_tachie_loc_op_update_chara_op_id_foreign" foreign key ("update_chara_op_id") references "update_chara_op" ("id") on update cascade;');

    this.addSql('alter table "remove_tachie_loc_op" add constraint "remove_tachie_loc_op_update_chara_op_id_foreign" foreign key ("update_chara_op_id") references "update_chara_op" ("id") on update cascade;');

    this.addSql('alter table "update_tachie_loc_op" add constraint "update_tachie_loc_op_update_chara_op_id_foreign" foreign key ("update_chara_op_id") references "update_chara_op" ("id") on update cascade;');

    this.addSql('alter table "remove_chara_op" add constraint "remove_chara_op_room_op_id_foreign" foreign key ("room_op_id") references "room_op" ("id") on update cascade;');

    this.addSql('alter table "removed_bool_param" add constraint "removed_bool_param_remove_chara_op_id_foreign" foreign key ("remove_chara_op_id") references "remove_chara_op" ("id") on update cascade;');

    this.addSql('alter table "removed_num_param" add constraint "removed_num_param_remove_chara_op_id_foreign" foreign key ("remove_chara_op_id") references "remove_chara_op" ("id") on update cascade;');

    this.addSql('alter table "removed_num_max_param" add constraint "removed_num_max_param_remove_chara_op_id_foreign" foreign key ("remove_chara_op_id") references "remove_chara_op" ("id") on update cascade;');

    this.addSql('alter table "removed_str_param" add constraint "removed_str_param_remove_chara_op_id_foreign" foreign key ("remove_chara_op_id") references "remove_chara_op" ("id") on update cascade;');

    this.addSql('alter table "removed_chara_piece" add constraint "removed_chara_piece_remove_chara_op_id_foreign" foreign key ("remove_chara_op_id") references "remove_chara_op" ("id") on update cascade;');

    this.addSql('alter table "removed_tachie_loc" add constraint "removed_tachie_loc_remove_chara_op_id_foreign" foreign key ("remove_chara_op_id") references "remove_chara_op" ("id") on update cascade;');

    this.addSql('alter table "add_chara_op" add constraint "add_chara_op_room_op_id_foreign" foreign key ("room_op_id") references "room_op" ("id") on update cascade;');

    this.addSql('alter table "chara" add constraint "chara_room_id_foreign" foreign key ("room_id") references "room" ("id") on update cascade;');

    this.addSql('alter table "bool_param" add constraint "bool_param_chara_id_foreign" foreign key ("chara_id") references "chara" ("id") on update cascade;');

    this.addSql('alter table "num_param" add constraint "num_param_chara_id_foreign" foreign key ("chara_id") references "chara" ("id") on update cascade;');

    this.addSql('alter table "num_max_param" add constraint "num_max_param_chara_id_foreign" foreign key ("chara_id") references "chara" ("id") on update cascade;');

    this.addSql('alter table "str_param" add constraint "str_param_chara_id_foreign" foreign key ("chara_id") references "chara" ("id") on update cascade;');

    this.addSql('alter table "chara_piece" add constraint "chara_piece_chara_id_foreign" foreign key ("chara_id") references "chara" ("id") on update cascade;');

    this.addSql('alter table "tachie_loc" add constraint "tachie_loc_chara_id_foreign" foreign key ("chara_id") references "chara" ("id") on update cascade;');

    this.addSql('alter table "update_board_op" add constraint "update_board_op_room_op_id_foreign" foreign key ("room_op_id") references "room_op" ("id") on update cascade;');

    this.addSql('alter table "remove_board_op" add constraint "remove_board_op_room_op_id_foreign" foreign key ("room_op_id") references "room_op" ("id") on update cascade;');

    this.addSql('alter table "add_board_op" add constraint "add_board_op_room_op_id_foreign" foreign key ("room_op_id") references "room_op" ("id") on update cascade;');

    this.addSql('alter table "board" add constraint "board_room_id_foreign" foreign key ("room_id") references "room" ("id") on update cascade;');

    this.addSql('alter table "room_op" add constraint "room_op_prev_revision_room_id_unique" unique ("prev_revision", "room_id");');

    this.addSql('alter table "room_pub_ch" add constraint "room_pub_ch_room_id_key_unique" unique ("room_id", "key");');

    this.addSql('alter table "update_room_bgm_op" add constraint "update_room_bgm_op_room_op_id_channel_key_unique" unique ("room_op_id", "channel_key");');

    this.addSql('alter table "remove_room_bgm_op" add constraint "remove_room_bgm_op_room_op_id_channel_key_unique" unique ("room_op_id", "channel_key");');

    this.addSql('alter table "add_room_bgm_op" add constraint "add_room_bgm_op_room_op_id_channel_key_unique" unique ("room_op_id", "channel_key");');

    this.addSql('alter table "room_bgm" add constraint "room_bgm_room_id_channel_key_unique" unique ("room_id", "channel_key");');

    this.addSql('alter table "update_param_name_op" add constraint "update_param_name_op_room_op_id_type_key_unique" unique ("room_op_id", "type", "key");');

    this.addSql('alter table "remove_param_name_op" add constraint "remove_param_name_op_room_op_id_type_key_unique" unique ("room_op_id", "type", "key");');

    this.addSql('alter table "add_param_name_op" add constraint "add_param_name_op_room_op_id_type_key_unique" unique ("room_op_id", "type", "key");');

    this.addSql('alter table "param_name" add constraint "param_name_room_id_type_key_unique" unique ("room_id", "type", "key");');

    this.addSql('alter table "remove_partici_op" add constraint "remove_partici_op_room_op_id_user_user_uid_unique" unique ("room_op_id", "user_user_uid");');

    this.addSql('alter table "removed_my_value" add constraint "removed_my_value_remove_partici_op_id_state_id_unique" unique ("remove_partici_op_id", "state_id");');

    this.addSql('alter table "removed_my_value_piece_by_partici" add constraint "removed_my_value_piece_by_partici_unique" unique ("board_id", "board_created_by", "removed_my_value_id");');

    this.addSql('alter table "update_partici_op" add constraint "update_partici_op_room_op_id_user_user_uid_unique" unique ("room_op_id", "user_user_uid");');

    this.addSql('alter table "add_my_value_op" add constraint "add_my_value_op_update_partici_op_id_state_id_unique" unique ("update_partici_op_id", "state_id");');

    this.addSql('alter table "remove_my_value_op" add constraint "remove_my_value_op_update_partici_op_id_state_id_unique" unique ("update_partici_op_id", "state_id");');

    this.addSql('alter table "removed_my_value_piece_by_my_value" add constraint "removed_my_value_piece_by_my_value_unique" unique ("board_id", "board_created_by", "remove_my_value_op_id");');

    this.addSql('alter table "update_my_value_op" add constraint "update_my_value_op_update_partici_op_id_state_id_unique" unique ("update_partici_op_id", "state_id");');

    this.addSql('alter table "add_my_value_piece_op" add constraint "add_my_value_piece_op_unique" unique ("board_id", "board_created_by", "update_my_value_op_id");');

    this.addSql('alter table "remove_my_value_piece_op" add constraint "remove_my_value_piece_op_unique" unique ("board_id", "board_created_by", "update_my_value_op_id");');

    this.addSql('alter table "update_my_value_piece_op" add constraint "update_my_value_piece_op_unique" unique ("board_id", "board_created_by", "update_my_value_op_id");');

    this.addSql('alter table "add_partici_op" add constraint "add_partici_op_room_op_id_user_user_uid_unique" unique ("room_op_id", "user_user_uid");');

    this.addSql('alter table "partici" add constraint "partici_user_user_uid_room_id_unique" unique ("user_user_uid", "room_id");');

    this.addSql('alter table "my_value" add constraint "my_value_partici_id_state_id_unique" unique ("partici_id", "state_id");');

    this.addSql('alter table "my_value_piece" add constraint "my_value_piece_unique" unique ("my_value_id", "board_id", "board_created_by");');

    this.addSql('alter table "update_chara_op" add constraint "update_chara_op_unique" unique ("room_op_id", "created_by", "state_id");');

    this.addSql('alter table "update_bool_param_op" add constraint "update_bool_param_op_update_chara_op_id_key_unique" unique ("update_chara_op_id", "key");');

    this.addSql('alter table "update_num_param_op" add constraint "update_num_param_op_update_chara_op_id_key_unique" unique ("update_chara_op_id", "key");');

    this.addSql('alter table "update_num_max_param_op" add constraint "update_num_max_param_op_update_chara_op_id_key_unique" unique ("update_chara_op_id", "key");');

    this.addSql('alter table "update_str_param_op" add constraint "update_str_param_op_update_chara_op_id_key_unique" unique ("update_chara_op_id", "key");');

    this.addSql('alter table "add_chara_piece_op" add constraint "add_chara_piece_op_unique" unique ("update_chara_op_id", "board_created_by", "board_id");');

    this.addSql('alter table "remove_chara_piece_op" add constraint "remove_chara_piece_op_unique" unique ("update_chara_op_id", "board_created_by", "board_id");');

    this.addSql('alter table "update_chara_piece_op" add constraint "update_chara_piece_op_unique" unique ("update_chara_op_id", "board_created_by", "board_id");');

    this.addSql('alter table "add_tachie_loc_op" add constraint "add_tachie_loc_op_unique" unique ("update_chara_op_id", "board_created_by", "board_id");');

    this.addSql('alter table "remove_tachie_loc_op" add constraint "remove_tachie_loc_op_unique" unique ("update_chara_op_id", "board_created_by", "board_id");');

    this.addSql('alter table "update_tachie_loc_op" add constraint "update_tachie_loc_op_unique" unique ("update_chara_op_id", "board_created_by", "board_id");');

    this.addSql('alter table "remove_chara_op" add constraint "remove_chara_op_unique" unique ("room_op_id", "created_by", "state_id");');

    this.addSql('alter table "removed_bool_param" add constraint "removed_bool_param_remove_chara_op_id_key_unique" unique ("remove_chara_op_id", "key");');

    this.addSql('alter table "removed_num_param" add constraint "removed_num_param_remove_chara_op_id_key_unique" unique ("remove_chara_op_id", "key");');

    this.addSql('alter table "removed_num_max_param" add constraint "removed_num_max_param_remove_chara_op_id_key_unique" unique ("remove_chara_op_id", "key");');

    this.addSql('alter table "removed_str_param" add constraint "removed_str_param_remove_chara_op_id_key_unique" unique ("remove_chara_op_id", "key");');

    this.addSql('alter table "removed_chara_piece" add constraint "removed_chara_piece_unique" unique ("remove_chara_op_id", "board_created_by", "board_id");');

    this.addSql('alter table "removed_tachie_loc" add constraint "removed_tachie_loc_unique" unique ("remove_chara_op_id", "board_created_by", "board_id");');

    this.addSql('alter table "add_chara_op" add constraint "add_chara_op_unique" unique ("room_op_id", "created_by", "state_id");');

    this.addSql('alter table "chara" add constraint "chara_created_by_state_id_unique" unique ("created_by", "state_id");');

    this.addSql('alter table "bool_param" add constraint "bool_param_chara_id_key_unique" unique ("chara_id", "key");');

    this.addSql('alter table "num_param" add constraint "num_param_chara_id_key_unique" unique ("chara_id", "key");');

    this.addSql('alter table "num_max_param" add constraint "num_max_param_chara_id_key_unique" unique ("chara_id", "key");');

    this.addSql('alter table "str_param" add constraint "str_param_chara_id_key_unique" unique ("chara_id", "key");');

    this.addSql('alter table "chara_piece" add constraint "chara_piece_unique" unique ("chara_id", "board_created_by", "board_id");');

    this.addSql('alter table "tachie_loc" add constraint "tachie_loc_unique" unique ("chara_id", "board_created_by", "board_id");');

    this.addSql('alter table "update_board_op" add constraint "update_board_op_unique" unique ("room_op_id", "created_by", "state_id");');

    this.addSql('alter table "remove_board_op" add constraint "remove_board_op_unique" unique ("room_op_id", "created_by", "state_id");');

    this.addSql('alter table "add_board_op" add constraint "add_board_op_unique" unique ("room_op_id", "created_by", "state_id");');

    this.addSql('alter table "board" add constraint "board_created_by_state_id_unique" unique ("created_by", "state_id");');
  }

}
