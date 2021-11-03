import { Migration } from '@mikro-orm/migrations';

export class Migration20211026154452 extends Migration {
    async up(): Promise<void> {
        this.addSql(
            'create table "user" ("user_uid" varchar(255) not null, "baas_type" varchar(255) not null, "is_entry" bool not null);'
        );
        this.addSql('alter table "user" add constraint "user_pkey" primary key ("user_uid");');
        this.addSql('create index "user_baas_type_index" on "user" ("baas_type");');
        this.addSql('create index "user_is_entry_index" on "user" ("is_entry");');

        this.addSql(
            'create table "file" ("filename" varchar(255) not null, "screenname" varchar(255) not null, "created_at" timestamptz(0) null, "encoding" varchar(255) not null, "size" int4 not null, "thumb_filename" varchar(255) null, "mimetype" varchar(255) not null, "filesize" int4 not null, "list_permission" varchar(255) not null, "rename_permission" varchar(255) not null, "delete_permission" varchar(255) not null, "created_by_user_uid" varchar(255) not null);'
        );
        this.addSql('alter table "file" add constraint "file_pkey" primary key ("filename");');
        this.addSql('create index "file_screenname_index" on "file" ("screenname");');
        this.addSql('create index "file_created_at_index" on "file" ("created_at");');
        this.addSql('create index "file_thumb_filename_index" on "file" ("thumb_filename");');
        this.addSql('create index "file_mimetype_index" on "file" ("mimetype");');
        this.addSql('create index "file_filesize_index" on "file" ("filesize");');
        this.addSql('create index "file_list_permission_index" on "file" ("list_permission");');
        this.addSql('create index "file_rename_permission_index" on "file" ("rename_permission");');
        this.addSql('create index "file_delete_permission_index" on "file" ("delete_permission");');

        this.addSql(
            'create table "file_tag" ("id" varchar(255) not null, "name" varchar(255) not null, "user_user_uid" varchar(255) not null);'
        );
        this.addSql('alter table "file_tag" add constraint "file_tag_pkey" primary key ("id");');

        this.addSql(
            'create table "file_file_tags" ("file_filename" varchar(255) not null, "file_tag_id" varchar(255) not null);'
        );
        this.addSql(
            'alter table "file_file_tags" add constraint "file_file_tags_pkey" primary key ("file_filename", "file_tag_id");'
        );

        this.addSql(
            'create table "room" ("id" varchar(255) not null, "version" int4 not null default 1, "created_at" timestamptz(0) null, "updated_at" timestamptz(0) null, "join_as_player_phrase" varchar(255) null, "join_as_spectator_phrase" varchar(255) null, "created_by" varchar(255) not null, "name" varchar(255) not null, "value" jsonb not null, "revision" int4 not null);'
        );
        this.addSql('alter table "room" add constraint "room_pkey" primary key ("id");');
        this.addSql('create index "room_version_index" on "room" ("version");');
        this.addSql('create index "room_created_at_index" on "room" ("created_at");');
        this.addSql('create index "room_updated_at_index" on "room" ("updated_at");');
        this.addSql('create index "room_created_by_index" on "room" ("created_by");');

        this.addSql(
            'create table "room_op" ("id" varchar(255) not null, "prev_revision" int4 not null, "value" jsonb not null, "room_id" varchar(255) not null);'
        );
        this.addSql('alter table "room_op" add constraint "room_op_pkey" primary key ("id");');
        this.addSql('create index "room_op_prev_revision_index" on "room_op" ("prev_revision");');

        this.addSql(
            'create table "room_prv_msg" ("id" varchar(255) not null, "version" int4 not null default 1, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) null, "init_text_source" varchar(65535) null default \'\', "init_text" varchar(65535) not null default \'\', "updated_text" varchar(65535) null, "text_updated_at" int4 null default null, "text_color" varchar(255) null, "command_result" varchar(65535) null, "command_is_success" bool null default null, "alt_text_to_secret" varchar(65535) null, "is_secret" bool not null, "chara_state_id" varchar(255) null, "chara_name" varchar(255) null, "chara_is_private" bool null default null, "chara_image_path" varchar(65535) null default null, "chara_image_source_type" jsonb null default null, "chara_tachie_image_path" varchar(65535) null default null, "chara_tachie_image_source_type" varchar(255) null default null, "custom_name" varchar(255) null, "created_by_user_uid" varchar(255) null, "room_id" varchar(255) not null);'
        );
        this.addSql(
            'alter table "room_prv_msg" add constraint "room_prv_msg_pkey" primary key ("id");'
        );
        this.addSql('create index "room_prv_msg_version_index" on "room_prv_msg" ("version");');
        this.addSql(
            'create index "room_prv_msg_created_at_index" on "room_prv_msg" ("created_at");'
        );
        this.addSql(
            'create index "room_prv_msg_updated_at_index" on "room_prv_msg" ("updated_at");'
        );
        this.addSql('create index "room_prv_msg_is_secret_index" on "room_prv_msg" ("is_secret");');
        this.addSql(
            'create index "room_prv_msg_chara_state_id_index" on "room_prv_msg" ("chara_state_id");'
        );

        this.addSql(
            'create table "user_visible_room_prv_msgs" ("user_user_uid" varchar(255) not null, "room_prv_msg_id" varchar(255) not null);'
        );
        this.addSql(
            'alter table "user_visible_room_prv_msgs" add constraint "user_visible_room_prv_msgs_pkey" primary key ("user_user_uid", "room_prv_msg_id");'
        );

        this.addSql(
            'create table "dice_piece_value_log" ("id" varchar(255) not null, "character_created_by" varchar(255) not null, "character_id" varchar(255) not null, "created_at" timestamptz(0) not null, "state_id" varchar(255) not null, "value" jsonb null, "room_id" varchar(255) not null);'
        );
        this.addSql(
            'alter table "dice_piece_value_log" add constraint "dice_piece_value_log_pkey" primary key ("id");'
        );
        this.addSql(
            'create index "dice_piece_value_log_character_created_by_index" on "dice_piece_value_log" ("character_created_by");'
        );
        this.addSql(
            'create index "dice_piece_value_log_character_id_index" on "dice_piece_value_log" ("character_id");'
        );
        this.addSql(
            'create index "dice_piece_value_log_state_id_index" on "dice_piece_value_log" ("state_id");'
        );

        this.addSql(
            'create table "string_piece_value_log" ("id" varchar(255) not null, "character_created_by" varchar(255) not null, "character_id" varchar(255) not null, "created_at" timestamptz(0) not null, "state_id" varchar(255) not null, "value" jsonb null, "room_id" varchar(255) not null);'
        );
        this.addSql(
            'alter table "string_piece_value_log" add constraint "string_piece_value_log_pkey" primary key ("id");'
        );
        this.addSql(
            'create index "string_piece_value_log_character_created_by_index" on "string_piece_value_log" ("character_created_by");'
        );
        this.addSql(
            'create index "string_piece_value_log_character_id_index" on "string_piece_value_log" ("character_id");'
        );
        this.addSql(
            'create index "string_piece_value_log_state_id_index" on "string_piece_value_log" ("state_id");'
        );

        this.addSql(
            'create table "room_pub_ch" ("id" varchar(255) not null, "version" int4 not null default 1, "updated_at" timestamptz(0) null, "key" varchar(255) not null, "name" varchar(255) null, "room_id" varchar(255) not null);'
        );
        this.addSql(
            'alter table "room_pub_ch" add constraint "room_pub_ch_pkey" primary key ("id");'
        );
        this.addSql('create index "room_pub_ch_version_index" on "room_pub_ch" ("version");');
        this.addSql('create index "room_pub_ch_updated_at_index" on "room_pub_ch" ("updated_at");');
        this.addSql('create index "room_pub_ch_key_index" on "room_pub_ch" ("key");');

        this.addSql(
            'create table "room_pub_msg" ("id" varchar(255) not null, "version" int4 not null default 1, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) null, "init_text_source" varchar(65535) null default \'\', "init_text" varchar(65535) not null default \'\', "updated_text" varchar(65535) null, "text_updated_at" int4 null default null, "text_color" varchar(255) null, "command_result" varchar(65535) null, "command_is_success" bool null default null, "alt_text_to_secret" varchar(65535) null, "is_secret" bool not null, "chara_state_id" varchar(255) null, "chara_name" varchar(255) null, "chara_is_private" bool null default null, "chara_image_path" varchar(65535) null default null, "chara_image_source_type" varchar(255) null default null, "chara_tachie_image_path" varchar(65535) null default null, "chara_tachie_image_source_type" varchar(255) null default null, "custom_name" varchar(255) null, "room_pub_ch_id" varchar(255) not null, "created_by_user_uid" varchar(255) null);'
        );
        this.addSql(
            'alter table "room_pub_msg" add constraint "room_pub_msg_pkey" primary key ("id");'
        );
        this.addSql('create index "room_pub_msg_version_index" on "room_pub_msg" ("version");');
        this.addSql(
            'create index "room_pub_msg_created_at_index" on "room_pub_msg" ("created_at");'
        );
        this.addSql(
            'create index "room_pub_msg_updated_at_index" on "room_pub_msg" ("updated_at");'
        );
        this.addSql(
            'create index "room_pub_msg_command_is_success_index" on "room_pub_msg" ("command_is_success");'
        );
        this.addSql('create index "room_pub_msg_is_secret_index" on "room_pub_msg" ("is_secret");');
        this.addSql(
            'create index "room_pub_msg_chara_state_id_index" on "room_pub_msg" ("chara_state_id");'
        );

        this.addSql(
            'create table "room_se" ("id" varchar(255) not null, "created_at" timestamptz(0) not null, "file_path" varchar(255) not null, "file_source_type" varchar(255) not null, "volume" int4 not null, "created_by_user_uid" varchar(255) null, "room_id" varchar(255) not null);'
        );
        this.addSql('alter table "room_se" add constraint "room_se_pkey" primary key ("id");');

        this.addSql(
            'create table "participant" ("id" varchar(255) not null, "role" varchar(255) null, "name" varchar(255) null, "room_id" varchar(255) not null, "user_user_uid" varchar(255) not null);'
        );
        this.addSql(
            'alter table "participant" add constraint "participant_pkey" primary key ("id");'
        );
        this.addSql('create index "participant_role_index" on "participant" ("role");');

        this.addSql(
            'alter table "file" add constraint "file_created_by_user_uid_foreign" foreign key ("created_by_user_uid") references "user" ("user_uid") on update cascade;'
        );

        this.addSql(
            'alter table "file_tag" add constraint "file_tag_user_user_uid_foreign" foreign key ("user_user_uid") references "user" ("user_uid") on update cascade;'
        );

        this.addSql(
            'alter table "file_file_tags" add constraint "file_file_tags_file_filename_foreign" foreign key ("file_filename") references "file" ("filename") on update cascade on delete cascade;'
        );
        this.addSql(
            'alter table "file_file_tags" add constraint "file_file_tags_file_tag_id_foreign" foreign key ("file_tag_id") references "file_tag" ("id") on update cascade on delete cascade;'
        );

        this.addSql(
            'alter table "room_op" add constraint "room_op_room_id_foreign" foreign key ("room_id") references "room" ("id") on update cascade;'
        );

        this.addSql(
            'alter table "room_prv_msg" add constraint "room_prv_msg_created_by_user_uid_foreign" foreign key ("created_by_user_uid") references "user" ("user_uid") on update cascade on delete set null;'
        );
        this.addSql(
            'alter table "room_prv_msg" add constraint "room_prv_msg_room_id_foreign" foreign key ("room_id") references "room" ("id") on update cascade;'
        );

        this.addSql(
            'alter table "user_visible_room_prv_msgs" add constraint "user_visible_room_prv_msgs_user_user_uid_foreign" foreign key ("user_user_uid") references "user" ("user_uid") on update cascade on delete cascade;'
        );
        this.addSql(
            'alter table "user_visible_room_prv_msgs" add constraint "user_visible_room_prv_msgs_room_prv_msg_id_foreign" foreign key ("room_prv_msg_id") references "room_prv_msg" ("id") on update cascade on delete cascade;'
        );

        this.addSql(
            'alter table "dice_piece_value_log" add constraint "dice_piece_value_log_room_id_foreign" foreign key ("room_id") references "room" ("id") on update cascade;'
        );

        this.addSql(
            'alter table "string_piece_value_log" add constraint "string_piece_value_log_room_id_foreign" foreign key ("room_id") references "room" ("id") on update cascade;'
        );

        this.addSql(
            'alter table "room_pub_ch" add constraint "room_pub_ch_room_id_foreign" foreign key ("room_id") references "room" ("id") on update cascade;'
        );

        this.addSql(
            'alter table "room_pub_msg" add constraint "room_pub_msg_room_pub_ch_id_foreign" foreign key ("room_pub_ch_id") references "room_pub_ch" ("id") on update cascade;'
        );
        this.addSql(
            'alter table "room_pub_msg" add constraint "room_pub_msg_created_by_user_uid_foreign" foreign key ("created_by_user_uid") references "user" ("user_uid") on update cascade on delete set null;'
        );

        this.addSql(
            'alter table "room_se" add constraint "room_se_created_by_user_uid_foreign" foreign key ("created_by_user_uid") references "user" ("user_uid") on update cascade on delete set null;'
        );
        this.addSql(
            'alter table "room_se" add constraint "room_se_room_id_foreign" foreign key ("room_id") references "room" ("id") on update cascade;'
        );

        this.addSql(
            'alter table "participant" add constraint "participant_room_id_foreign" foreign key ("room_id") references "room" ("id") on update cascade;'
        );
        this.addSql(
            'alter table "participant" add constraint "participant_user_user_uid_foreign" foreign key ("user_user_uid") references "user" ("user_uid") on update cascade;'
        );

        this.addSql(
            'alter table "room_op" add constraint "room_op_prev_revision_room_id_unique" unique ("prev_revision", "room_id");'
        );

        this.addSql(
            'alter table "room_pub_ch" add constraint "room_pub_ch_room_id_key_unique" unique ("room_id", "key");'
        );

        this.addSql(
            'alter table "participant" add constraint "participant_room_id_user_user_uid_unique" unique ("room_id", "user_user_uid");'
        );
    }
}
