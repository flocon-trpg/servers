import { Migration } from '@mikro-orm/migrations';

export class Migration20220410135635 extends Migration {
    async up(): Promise<void> {
        this.addSql(
            'create table `user` (`user_uid` varchar(255) not null, `baas_type` varchar(255) not null, `is_entry` tinyint(1) not null, primary key (`user_uid`)) default character set utf8mb4 engine = InnoDB;',
        );
        this.addSql('alter table `user` add index `user_baas_type_index`(`baas_type`);');
        this.addSql('alter table `user` add index `user_is_entry_index`(`is_entry`);');

        this.addSql(
            'create table `file` (`filename` varchar(255) not null, `screenname` varchar(255) not null, `created_at` datetime null, `encoding` varchar(255) not null, `size` int not null, `thumb_filename` varchar(255) null, `mimetype` varchar(255) not null, `filesize` int not null, `list_permission` varchar(255) not null, `rename_permission` varchar(255) not null, `delete_permission` varchar(255) not null, `created_by_user_uid` varchar(255) not null, primary key (`filename`)) default character set utf8mb4 engine = InnoDB;',
        );
        this.addSql('alter table `file` add index `file_screenname_index`(`screenname`);');
        this.addSql('alter table `file` add index `file_created_at_index`(`created_at`);');
        this.addSql('alter table `file` add index `file_thumb_filename_index`(`thumb_filename`);');
        this.addSql('alter table `file` add index `file_mimetype_index`(`mimetype`);');
        this.addSql('alter table `file` add index `file_filesize_index`(`filesize`);');
        this.addSql(
            'alter table `file` add index `file_list_permission_index`(`list_permission`);',
        );
        this.addSql(
            'alter table `file` add index `file_rename_permission_index`(`rename_permission`);',
        );
        this.addSql(
            'alter table `file` add index `file_delete_permission_index`(`delete_permission`);',
        );
        this.addSql(
            'alter table `file` add index `file_created_by_user_uid_index`(`created_by_user_uid`);',
        );

        this.addSql(
            'create table `file_tag` (`id` varchar(255) not null, `name` varchar(255) not null, `user_user_uid` varchar(255) not null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;',
        );
        this.addSql(
            'alter table `file_tag` add index `file_tag_user_user_uid_index`(`user_user_uid`);',
        );

        this.addSql(
            'create table `file_file_tags` (`file_filename` varchar(255) not null, `file_tag_id` varchar(255) not null, primary key (`file_filename`, `file_tag_id`)) default character set utf8mb4 engine = InnoDB;',
        );
        this.addSql(
            'alter table `file_file_tags` add index `file_file_tags_file_filename_index`(`file_filename`);',
        );
        this.addSql(
            'alter table `file_file_tags` add index `file_file_tags_file_tag_id_index`(`file_tag_id`);',
        );

        this.addSql(
            'create table `room` (`id` varchar(255) not null, `version` int not null default 1, `created_at` datetime null, `updated_at` datetime null, `player_password_hash` varchar(255) null, `spectator_password_hash` varchar(255) null, `created_by` varchar(255) not null, `name` varchar(255) not null, `value` json not null, `revision` int not null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;',
        );
        this.addSql('alter table `room` add index `room_version_index`(`version`);');
        this.addSql('alter table `room` add index `room_created_at_index`(`created_at`);');
        this.addSql('alter table `room` add index `room_updated_at_index`(`updated_at`);');
        this.addSql('alter table `room` add index `room_created_by_index`(`created_by`);');

        this.addSql(
            'create table `room_op` (`id` varchar(255) not null, `created_at` datetime null default null, `prev_revision` int not null, `value` json not null, `room_id` varchar(255) not null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;',
        );
        this.addSql('alter table `room_op` add index `room_op_created_at_index`(`created_at`);');
        this.addSql(
            'alter table `room_op` add index `room_op_prev_revision_index`(`prev_revision`);',
        );
        this.addSql('alter table `room_op` add index `room_op_room_id_index`(`room_id`);');
        this.addSql(
            'alter table `room_op` add unique `room_op_prev_revision_room_id_unique`(`prev_revision`, `room_id`);',
        );

        this.addSql(
            'create table `room_prv_msg` (`id` varchar(255) not null, `version` int not null default 1, `created_at` datetime not null, `updated_at` datetime null, `init_text_source` text null default null, `init_text` text null default null, `updated_text` text null, `text_updated_at` int null default null, `text_color` varchar(255) null, `command_result` text null, `command_is_success` tinyint(1) null default null, `alt_text_to_secret` text null, `is_secret` tinyint(1) not null, `chara_state_id` varchar(255) null, `chara_name` varchar(255) null, `chara_is_private` tinyint(1) null default null, `chara_image_path` text null default null, `chara_image_source_type` varchar(255) null default null, `chara_portrait_image_path` text null default null, `chara_portrait_image_source_type` varchar(255) null default null, `custom_name` varchar(255) null, `created_by_user_uid` varchar(255) null, `room_id` varchar(255) not null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;',
        );
        this.addSql(
            'alter table `room_prv_msg` add index `room_prv_msg_version_index`(`version`);',
        );
        this.addSql(
            'alter table `room_prv_msg` add index `room_prv_msg_created_at_index`(`created_at`);',
        );
        this.addSql(
            'alter table `room_prv_msg` add index `room_prv_msg_updated_at_index`(`updated_at`);',
        );
        this.addSql(
            'alter table `room_prv_msg` add index `room_prv_msg_is_secret_index`(`is_secret`);',
        );
        this.addSql(
            'alter table `room_prv_msg` add index `room_prv_msg_chara_state_id_index`(`chara_state_id`);',
        );
        this.addSql(
            'alter table `room_prv_msg` add index `room_prv_msg_created_by_user_uid_index`(`created_by_user_uid`);',
        );
        this.addSql(
            'alter table `room_prv_msg` add index `room_prv_msg_room_id_index`(`room_id`);',
        );

        this.addSql(
            'create table `user_visible_room_prv_msgs` (`user_user_uid` varchar(255) not null, `room_prv_msg_id` varchar(255) not null, primary key (`user_user_uid`, `room_prv_msg_id`)) default character set utf8mb4 engine = InnoDB;',
        );
        this.addSql(
            'alter table `user_visible_room_prv_msgs` add index `user_visible_room_prv_msgs_user_user_uid_index`(`user_user_uid`);',
        );
        this.addSql(
            'alter table `user_visible_room_prv_msgs` add index `user_visible_room_prv_msgs_room_prv_msg_id_index`(`room_prv_msg_id`);',
        );

        this.addSql(
            'create table `dice_piece_log` (`id` varchar(255) not null, `created_at` datetime not null, `state_id` varchar(255) not null, `value` json null, `room_id` varchar(255) not null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;',
        );
        this.addSql(
            'alter table `dice_piece_log` add index `dice_piece_log_state_id_index`(`state_id`);',
        );
        this.addSql(
            'alter table `dice_piece_log` add index `dice_piece_log_room_id_index`(`room_id`);',
        );

        this.addSql(
            'create table `string_piece_log` (`id` varchar(255) not null, `created_at` datetime not null, `state_id` varchar(255) not null, `value` json null, `room_id` varchar(255) not null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;',
        );
        this.addSql(
            'alter table `string_piece_log` add index `string_piece_log_state_id_index`(`state_id`);',
        );
        this.addSql(
            'alter table `string_piece_log` add index `string_piece_log_room_id_index`(`room_id`);',
        );

        this.addSql(
            'create table `room_pub_ch` (`id` varchar(255) not null, `version` int not null default 1, `updated_at` datetime null, `key` varchar(255) not null, `name` varchar(255) null, `room_id` varchar(255) not null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;',
        );
        this.addSql('alter table `room_pub_ch` add index `room_pub_ch_version_index`(`version`);');
        this.addSql(
            'alter table `room_pub_ch` add index `room_pub_ch_updated_at_index`(`updated_at`);',
        );
        this.addSql('alter table `room_pub_ch` add index `room_pub_ch_key_index`(`key`);');
        this.addSql('alter table `room_pub_ch` add index `room_pub_ch_room_id_index`(`room_id`);');
        this.addSql(
            'alter table `room_pub_ch` add unique `room_pub_ch_room_id_key_unique`(`room_id`, `key`);',
        );

        this.addSql(
            'create table `room_pub_msg` (`id` varchar(255) not null, `version` int not null default 1, `created_at` datetime not null, `updated_at` datetime null, `init_text_source` text null default null, `init_text` text null default null, `updated_text` text null, `text_updated_at` int null default null, `text_color` varchar(255) null, `command_result` text null, `command_is_success` tinyint(1) null default null, `alt_text_to_secret` text null, `is_secret` tinyint(1) not null, `chara_state_id` varchar(255) null, `chara_name` varchar(255) null, `chara_is_private` tinyint(1) null default null, `chara_image_path` text null default null, `chara_image_source_type` text null default null, `chara_portrait_image_path` text null default null, `chara_portrait_image_source_type` varchar(255) null default null, `custom_name` varchar(255) null, `room_pub_ch_id` varchar(255) not null, `created_by_user_uid` varchar(255) null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;',
        );
        this.addSql(
            'alter table `room_pub_msg` add index `room_pub_msg_version_index`(`version`);',
        );
        this.addSql(
            'alter table `room_pub_msg` add index `room_pub_msg_created_at_index`(`created_at`);',
        );
        this.addSql(
            'alter table `room_pub_msg` add index `room_pub_msg_updated_at_index`(`updated_at`);',
        );
        this.addSql(
            'alter table `room_pub_msg` add index `room_pub_msg_command_is_success_index`(`command_is_success`);',
        );
        this.addSql(
            'alter table `room_pub_msg` add index `room_pub_msg_is_secret_index`(`is_secret`);',
        );
        this.addSql(
            'alter table `room_pub_msg` add index `room_pub_msg_chara_state_id_index`(`chara_state_id`);',
        );
        this.addSql(
            'alter table `room_pub_msg` add index `room_pub_msg_room_pub_ch_id_index`(`room_pub_ch_id`);',
        );
        this.addSql(
            'alter table `room_pub_msg` add index `room_pub_msg_created_by_user_uid_index`(`created_by_user_uid`);',
        );

        this.addSql(
            'create table `room_se` (`id` varchar(255) not null, `created_at` datetime not null, `file_path` varchar(255) not null, `file_source_type` varchar(255) not null, `volume` int not null, `created_by_user_uid` varchar(255) null, `room_id` varchar(255) not null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;',
        );
        this.addSql(
            'alter table `room_se` add index `room_se_created_by_user_uid_index`(`created_by_user_uid`);',
        );
        this.addSql('alter table `room_se` add index `room_se_room_id_index`(`room_id`);');

        this.addSql(
            'create table `participant` (`id` varchar(255) not null, `role` varchar(255) null, `name` varchar(255) null, `room_id` varchar(255) not null, `user_user_uid` varchar(255) not null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;',
        );
        this.addSql('alter table `participant` add index `participant_role_index`(`role`);');
        this.addSql('alter table `participant` add index `participant_room_id_index`(`room_id`);');
        this.addSql(
            'alter table `participant` add index `participant_user_user_uid_index`(`user_user_uid`);',
        );
        this.addSql(
            'alter table `participant` add unique `participant_room_id_user_user_uid_unique`(`room_id`, `user_user_uid`);',
        );

        this.addSql(
            'alter table `file` add constraint `file_created_by_user_uid_foreign` foreign key (`created_by_user_uid`) references `user` (`user_uid`) on update cascade;',
        );

        this.addSql(
            'alter table `file_tag` add constraint `file_tag_user_user_uid_foreign` foreign key (`user_user_uid`) references `user` (`user_uid`) on update cascade;',
        );

        this.addSql(
            'alter table `file_file_tags` add constraint `file_file_tags_file_filename_foreign` foreign key (`file_filename`) references `file` (`filename`) on update cascade on delete cascade;',
        );
        this.addSql(
            'alter table `file_file_tags` add constraint `file_file_tags_file_tag_id_foreign` foreign key (`file_tag_id`) references `file_tag` (`id`) on update cascade on delete cascade;',
        );

        this.addSql(
            'alter table `room_op` add constraint `room_op_room_id_foreign` foreign key (`room_id`) references `room` (`id`) on update cascade;',
        );

        this.addSql(
            'alter table `room_prv_msg` add constraint `room_prv_msg_created_by_user_uid_foreign` foreign key (`created_by_user_uid`) references `user` (`user_uid`) on update cascade on delete set null;',
        );
        this.addSql(
            'alter table `room_prv_msg` add constraint `room_prv_msg_room_id_foreign` foreign key (`room_id`) references `room` (`id`) on update cascade;',
        );

        this.addSql(
            'alter table `user_visible_room_prv_msgs` add constraint `user_visible_room_prv_msgs_user_user_uid_foreign` foreign key (`user_user_uid`) references `user` (`user_uid`) on update cascade on delete cascade;',
        );
        this.addSql(
            'alter table `user_visible_room_prv_msgs` add constraint `user_visible_room_prv_msgs_room_prv_msg_id_foreign` foreign key (`room_prv_msg_id`) references `room_prv_msg` (`id`) on update cascade on delete cascade;',
        );

        this.addSql(
            'alter table `dice_piece_log` add constraint `dice_piece_log_room_id_foreign` foreign key (`room_id`) references `room` (`id`) on update cascade;',
        );

        this.addSql(
            'alter table `string_piece_log` add constraint `string_piece_log_room_id_foreign` foreign key (`room_id`) references `room` (`id`) on update cascade;',
        );

        this.addSql(
            'alter table `room_pub_ch` add constraint `room_pub_ch_room_id_foreign` foreign key (`room_id`) references `room` (`id`) on update cascade;',
        );

        this.addSql(
            'alter table `room_pub_msg` add constraint `room_pub_msg_room_pub_ch_id_foreign` foreign key (`room_pub_ch_id`) references `room_pub_ch` (`id`) on update cascade;',
        );
        this.addSql(
            'alter table `room_pub_msg` add constraint `room_pub_msg_created_by_user_uid_foreign` foreign key (`created_by_user_uid`) references `user` (`user_uid`) on update cascade on delete set null;',
        );

        this.addSql(
            'alter table `room_se` add constraint `room_se_created_by_user_uid_foreign` foreign key (`created_by_user_uid`) references `user` (`user_uid`) on update cascade on delete set null;',
        );
        this.addSql(
            'alter table `room_se` add constraint `room_se_room_id_foreign` foreign key (`room_id`) references `room` (`id`) on update cascade;',
        );

        this.addSql(
            'alter table `participant` add constraint `participant_room_id_foreign` foreign key (`room_id`) references `room` (`id`) on update cascade;',
        );
        this.addSql(
            'alter table `participant` add constraint `participant_user_user_uid_foreign` foreign key (`user_user_uid`) references `user` (`user_uid`) on update cascade;',
        );
    }
}
