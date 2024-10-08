import { Migration } from '@mikro-orm/migrations';

export class Migration20211201185826 extends Migration {
    async up(): Promise<void> {
        this.addSql(
            'create table `user` (`user_uid` varchar not null, `baas_type` varchar not null, `is_entry` integer not null, primary key (`user_uid`));',
        );
        this.addSql('create index `user_baas_type_index` on `user` (`baas_type`);');
        this.addSql('create index `user_is_entry_index` on `user` (`is_entry`);');

        this.addSql(
            'create table `file` (`filename` varchar not null, `screenname` varchar not null, `created_at` datetime null, `encoding` varchar not null, `size` integer not null, `thumb_filename` varchar null, `mimetype` varchar not null, `filesize` integer not null, `list_permission` varchar not null, `rename_permission` varchar not null, `delete_permission` varchar not null, primary key (`filename`));',
        );
        this.addSql('create index `file_screenname_index` on `file` (`screenname`);');
        this.addSql('create index `file_created_at_index` on `file` (`created_at`);');
        this.addSql('create index `file_thumb_filename_index` on `file` (`thumb_filename`);');
        this.addSql('create index `file_mimetype_index` on `file` (`mimetype`);');
        this.addSql('create index `file_filesize_index` on `file` (`filesize`);');
        this.addSql('create index `file_list_permission_index` on `file` (`list_permission`);');
        this.addSql('create index `file_rename_permission_index` on `file` (`rename_permission`);');
        this.addSql('create index `file_delete_permission_index` on `file` (`delete_permission`);');

        this.addSql(
            'create table `file_tag` (`id` varchar not null, `name` varchar not null, primary key (`id`));',
        );

        this.addSql(
            'create table `file_file_tags` (`file_filename` varchar not null, `file_tag_id` varchar not null, primary key (`file_filename`, `file_tag_id`));',
        );
        this.addSql(
            'create index `file_file_tags_file_filename_index` on `file_file_tags` (`file_filename`);',
        );
        this.addSql(
            'create index `file_file_tags_file_tag_id_index` on `file_file_tags` (`file_tag_id`);',
        );

        this.addSql(
            'create table `room` (`id` varchar not null, `version` integer not null default 1, `created_at` datetime null, `updated_at` datetime null, `player_password_hash` varchar null, `spectator_password_hash` varchar null, `created_by` varchar not null, `name` varchar not null, `value` json not null, `revision` integer not null, primary key (`id`));',
        );
        this.addSql('create index `room_version_index` on `room` (`version`);');
        this.addSql('create index `room_created_at_index` on `room` (`created_at`);');
        this.addSql('create index `room_updated_at_index` on `room` (`updated_at`);');
        this.addSql('create index `room_created_by_index` on `room` (`created_by`);');

        this.addSql(
            'create table `room_op` (`id` varchar not null, `prev_revision` integer not null, `value` json not null, primary key (`id`));',
        );
        this.addSql('create index `room_op_prev_revision_index` on `room_op` (`prev_revision`);');

        this.addSql(
            "create table `room_prv_msg` (`id` varchar not null, `version` integer not null default 1, `created_at` datetime not null, `updated_at` datetime null, `init_text_source` varchar null default '', `init_text` varchar not null default '', `updated_text` varchar null, `text_updated_at` integer null default null, `text_color` varchar null, `command_result` varchar null, `command_is_success` integer null default null, `alt_text_to_secret` varchar null, `is_secret` integer not null, `chara_state_id` varchar null, `chara_name` varchar null, `chara_is_private` integer null default null, `chara_image_path` varchar null default null, `chara_image_source_type` varchar null default null, `chara_portrait_image_path` varchar null default null, `chara_portrait_image_source_type` varchar null default null, `custom_name` varchar null, primary key (`id`));",
        );
        this.addSql('create index `room_prv_msg_version_index` on `room_prv_msg` (`version`);');
        this.addSql(
            'create index `room_prv_msg_created_at_index` on `room_prv_msg` (`created_at`);',
        );
        this.addSql(
            'create index `room_prv_msg_updated_at_index` on `room_prv_msg` (`updated_at`);',
        );
        this.addSql('create index `room_prv_msg_is_secret_index` on `room_prv_msg` (`is_secret`);');
        this.addSql(
            'create index `room_prv_msg_chara_state_id_index` on `room_prv_msg` (`chara_state_id`);',
        );

        this.addSql(
            'create table `user_visible_room_prv_msgs` (`user_user_uid` varchar not null, `room_prv_msg_id` varchar not null, primary key (`user_user_uid`, `room_prv_msg_id`));',
        );
        this.addSql(
            'create index `user_visible_room_prv_msgs_user_user_uid_index` on `user_visible_room_prv_msgs` (`user_user_uid`);',
        );
        this.addSql(
            'create index `user_visible_room_prv_msgs_room_prv_msg_id_index` on `user_visible_room_prv_msgs` (`room_prv_msg_id`);',
        );

        this.addSql(
            'create table `dice_piece_log` (`id` varchar not null, `created_at` datetime not null, `state_id` varchar not null, `value` json null, primary key (`id`));',
        );
        this.addSql(
            'create index `dice_piece_log_state_id_index` on `dice_piece_log` (`state_id`);',
        );

        this.addSql(
            'create table `string_piece_log` (`id` varchar not null, `created_at` datetime not null, `state_id` varchar not null, `value` json null, primary key (`id`));',
        );
        this.addSql(
            'create index `string_piece_log_state_id_index` on `string_piece_log` (`state_id`);',
        );

        this.addSql(
            'create table `room_pub_ch` (`id` varchar not null, `version` integer not null default 1, `updated_at` datetime null, `key` varchar not null, `name` varchar null, primary key (`id`));',
        );
        this.addSql('create index `room_pub_ch_version_index` on `room_pub_ch` (`version`);');
        this.addSql('create index `room_pub_ch_updated_at_index` on `room_pub_ch` (`updated_at`);');
        this.addSql('create index `room_pub_ch_key_index` on `room_pub_ch` (`key`);');

        this.addSql(
            "create table `room_pub_msg` (`id` varchar not null, `version` integer not null default 1, `created_at` datetime not null, `updated_at` datetime null, `init_text_source` varchar null default '', `init_text` varchar not null default '', `updated_text` varchar null, `text_updated_at` integer null default null, `text_color` varchar null, `command_result` varchar null, `command_is_success` integer null default null, `alt_text_to_secret` varchar null, `is_secret` integer not null, `chara_state_id` varchar null, `chara_name` varchar null, `chara_is_private` integer null default null, `chara_image_path` varchar null default null, `chara_image_source_type` varchar null default null, `chara_portrait_image_path` varchar null default null, `chara_portrait_image_source_type` varchar null default null, `custom_name` varchar null, primary key (`id`));",
        );
        this.addSql('create index `room_pub_msg_version_index` on `room_pub_msg` (`version`);');
        this.addSql(
            'create index `room_pub_msg_created_at_index` on `room_pub_msg` (`created_at`);',
        );
        this.addSql(
            'create index `room_pub_msg_updated_at_index` on `room_pub_msg` (`updated_at`);',
        );
        this.addSql(
            'create index `room_pub_msg_command_is_success_index` on `room_pub_msg` (`command_is_success`);',
        );
        this.addSql('create index `room_pub_msg_is_secret_index` on `room_pub_msg` (`is_secret`);');
        this.addSql(
            'create index `room_pub_msg_chara_state_id_index` on `room_pub_msg` (`chara_state_id`);',
        );

        this.addSql(
            'create table `room_se` (`id` varchar not null, `created_at` datetime not null, `file_path` varchar not null, `file_source_type` varchar not null, `volume` integer not null, primary key (`id`));',
        );

        this.addSql(
            'create table `participant` (`id` varchar not null, `role` varchar null, `name` varchar null, primary key (`id`));',
        );
        this.addSql('create index `participant_role_index` on `participant` (`role`);');

        this.addSql('alter table `file` add column `created_by_user_uid` varchar null;');
        this.addSql(
            'create index `file_created_by_user_uid_index` on `file` (`created_by_user_uid`);',
        );

        this.addSql('alter table `file_tag` add column `user_user_uid` varchar null;');
        this.addSql('create index `file_tag_user_user_uid_index` on `file_tag` (`user_user_uid`);');

        this.addSql('alter table `room_op` add column `room_id` varchar null;');
        this.addSql('create index `room_op_room_id_index` on `room_op` (`room_id`);');

        this.addSql('alter table `room_prv_msg` add column `created_by_user_uid` varchar null;');
        this.addSql('alter table `room_prv_msg` add column `room_id` varchar null;');
        this.addSql(
            'create index `room_prv_msg_created_by_user_uid_index` on `room_prv_msg` (`created_by_user_uid`);',
        );
        this.addSql('create index `room_prv_msg_room_id_index` on `room_prv_msg` (`room_id`);');

        this.addSql('alter table `dice_piece_log` add column `room_id` varchar null;');
        this.addSql('create index `dice_piece_log_room_id_index` on `dice_piece_log` (`room_id`);');

        this.addSql('alter table `string_piece_log` add column `room_id` varchar null;');
        this.addSql(
            'create index `string_piece_log_room_id_index` on `string_piece_log` (`room_id`);',
        );

        this.addSql('alter table `room_pub_ch` add column `room_id` varchar null;');
        this.addSql('create index `room_pub_ch_room_id_index` on `room_pub_ch` (`room_id`);');

        this.addSql('alter table `room_pub_msg` add column `room_pub_ch_id` varchar null;');
        this.addSql('alter table `room_pub_msg` add column `created_by_user_uid` varchar null;');
        this.addSql(
            'create index `room_pub_msg_room_pub_ch_id_index` on `room_pub_msg` (`room_pub_ch_id`);',
        );
        this.addSql(
            'create index `room_pub_msg_created_by_user_uid_index` on `room_pub_msg` (`created_by_user_uid`);',
        );

        this.addSql('alter table `room_se` add column `created_by_user_uid` varchar null;');
        this.addSql('alter table `room_se` add column `room_id` varchar null;');
        this.addSql(
            'create index `room_se_created_by_user_uid_index` on `room_se` (`created_by_user_uid`);',
        );
        this.addSql('create index `room_se_room_id_index` on `room_se` (`room_id`);');

        this.addSql('alter table `participant` add column `room_id` varchar null;');
        this.addSql('alter table `participant` add column `user_user_uid` varchar null;');
        this.addSql('create index `participant_room_id_index` on `participant` (`room_id`);');
        this.addSql(
            'create index `participant_user_user_uid_index` on `participant` (`user_user_uid`);',
        );

        this.addSql(
            'create unique index `room_op_prev_revision_room_id_unique` on `room_op` (`prev_revision`, `room_id`);',
        );

        this.addSql(
            'create unique index `room_pub_ch_room_id_key_unique` on `room_pub_ch` (`room_id`, `key`);',
        );

        this.addSql(
            'create unique index `participant_room_id_user_user_uid_unique` on `participant` (`room_id`, `user_user_uid`);',
        );
    }
}
