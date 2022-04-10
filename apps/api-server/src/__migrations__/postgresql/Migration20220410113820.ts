import { Migration } from '@mikro-orm/migrations';

export class Migration20220410113820 extends Migration {
    async up(): Promise<void> {
        this.addSql(
            'alter table "room_prv_msg" drop constraint if exists "room_prv_msg_init_text_source_check";'
        );
        this.addSql(
            'alter table "room_prv_msg" alter column "init_text_source" type text using ("init_text_source"::text);'
        );
        this.addSql('alter table "room_prv_msg" alter column "init_text_source" set default null;');
        this.addSql(
            'alter table "room_prv_msg" drop constraint if exists "room_prv_msg_init_text_check";'
        );
        this.addSql(
            'alter table "room_prv_msg" alter column "init_text" type text using ("init_text"::text);'
        );
        this.addSql('alter table "room_prv_msg" alter column "init_text" set default null;');
        this.addSql('alter table "room_prv_msg" alter column "init_text" drop not null;');
        this.addSql(
            'alter table "room_prv_msg" drop constraint if exists "room_prv_msg_updated_text_check";'
        );
        this.addSql(
            'alter table "room_prv_msg" alter column "updated_text" type text using ("updated_text"::text);'
        );
        this.addSql(
            'alter table "room_prv_msg" drop constraint if exists "room_prv_msg_command_result_check";'
        );
        this.addSql(
            'alter table "room_prv_msg" alter column "command_result" type text using ("command_result"::text);'
        );
        this.addSql(
            'alter table "room_prv_msg" drop constraint if exists "room_prv_msg_alt_text_to_secret_check";'
        );
        this.addSql(
            'alter table "room_prv_msg" alter column "alt_text_to_secret" type text using ("alt_text_to_secret"::text);'
        );
        this.addSql(
            'alter table "room_prv_msg" drop constraint if exists "room_prv_msg_chara_image_path_check";'
        );
        this.addSql(
            'alter table "room_prv_msg" alter column "chara_image_path" type text using ("chara_image_path"::text);'
        );
        this.addSql(
            'alter table "room_prv_msg" drop constraint if exists "room_prv_msg_chara_image_source_type_check";'
        );
        this.addSql(
            'alter table "room_prv_msg" alter column "chara_image_source_type" type varchar(255) using ("chara_image_source_type"::varchar(255));'
        );
        this.addSql(
            'alter table "room_prv_msg" drop constraint if exists "room_prv_msg_chara_portrait_image_path_check";'
        );
        this.addSql(
            'alter table "room_prv_msg" alter column "chara_portrait_image_path" type text using ("chara_portrait_image_path"::text);'
        );

        this.addSql('alter table "room_pub_ch" drop constraint "room_pub_ch_room_id_key_unique";');
        this.addSql(
            'alter table "room_pub_ch" add constraint "room_pub_ch_room_id_key_unique" unique ("room_id", "key");'
        );

        this.addSql(
            'alter table "room_pub_msg" drop constraint if exists "room_pub_msg_init_text_source_check";'
        );
        this.addSql(
            'alter table "room_pub_msg" alter column "init_text_source" type text using ("init_text_source"::text);'
        );
        this.addSql('alter table "room_pub_msg" alter column "init_text_source" set default null;');
        this.addSql(
            'alter table "room_pub_msg" drop constraint if exists "room_pub_msg_init_text_check";'
        );
        this.addSql(
            'alter table "room_pub_msg" alter column "init_text" type text using ("init_text"::text);'
        );
        this.addSql('alter table "room_pub_msg" alter column "init_text" set default null;');
        this.addSql('alter table "room_pub_msg" alter column "init_text" drop not null;');
        this.addSql(
            'alter table "room_pub_msg" drop constraint if exists "room_pub_msg_updated_text_check";'
        );
        this.addSql(
            'alter table "room_pub_msg" alter column "updated_text" type text using ("updated_text"::text);'
        );
        this.addSql(
            'alter table "room_pub_msg" drop constraint if exists "room_pub_msg_command_result_check";'
        );
        this.addSql(
            'alter table "room_pub_msg" alter column "command_result" type text using ("command_result"::text);'
        );
        this.addSql(
            'alter table "room_pub_msg" drop constraint if exists "room_pub_msg_alt_text_to_secret_check";'
        );
        this.addSql(
            'alter table "room_pub_msg" alter column "alt_text_to_secret" type text using ("alt_text_to_secret"::text);'
        );
        this.addSql(
            'alter table "room_pub_msg" drop constraint if exists "room_pub_msg_chara_image_path_check";'
        );
        this.addSql(
            'alter table "room_pub_msg" alter column "chara_image_path" type text using ("chara_image_path"::text);'
        );
        this.addSql(
            'alter table "room_pub_msg" drop constraint if exists "room_pub_msg_chara_image_source_type_check";'
        );
        this.addSql(
            'alter table "room_pub_msg" alter column "chara_image_source_type" type text using ("chara_image_source_type"::text);'
        );
        this.addSql(
            'alter table "room_pub_msg" drop constraint if exists "room_pub_msg_chara_portrait_image_path_check";'
        );
        this.addSql(
            'alter table "room_pub_msg" alter column "chara_portrait_image_path" type text using ("chara_portrait_image_path"::text);'
        );
    }

    async down(): Promise<void> {
        this.addSql(
            'alter table "room_prv_msg" drop constraint if exists "room_prv_msg_init_text_source_check";'
        );
        this.addSql(
            'alter table "room_prv_msg" alter column "init_text_source" type varchar using ("init_text_source"::varchar);'
        );
        this.addSql('alter table "room_prv_msg" alter column "init_text_source" set default \'\';');
        this.addSql(
            'alter table "room_prv_msg" drop constraint if exists "room_prv_msg_init_text_check";'
        );
        this.addSql(
            'alter table "room_prv_msg" alter column "init_text" type varchar using ("init_text"::varchar);'
        );
        this.addSql('alter table "room_prv_msg" alter column "init_text" set default \'\';');
        this.addSql('alter table "room_prv_msg" alter column "init_text" set not null;');
        this.addSql(
            'alter table "room_prv_msg" drop constraint if exists "room_prv_msg_updated_text_check";'
        );
        this.addSql(
            'alter table "room_prv_msg" alter column "updated_text" type varchar using ("updated_text"::varchar);'
        );
        this.addSql(
            'alter table "room_prv_msg" drop constraint if exists "room_prv_msg_command_result_check";'
        );
        this.addSql(
            'alter table "room_prv_msg" alter column "command_result" type varchar using ("command_result"::varchar);'
        );
        this.addSql(
            'alter table "room_prv_msg" drop constraint if exists "room_prv_msg_alt_text_to_secret_check";'
        );
        this.addSql(
            'alter table "room_prv_msg" alter column "alt_text_to_secret" type varchar using ("alt_text_to_secret"::varchar);'
        );
        this.addSql(
            'alter table "room_prv_msg" drop constraint if exists "room_prv_msg_chara_image_path_check";'
        );
        this.addSql(
            'alter table "room_prv_msg" alter column "chara_image_path" type varchar using ("chara_image_path"::varchar);'
        );
        this.addSql(
            'alter table "room_prv_msg" drop constraint if exists "room_prv_msg_chara_image_source_type_check";'
        );
        this.addSql(
            'alter table "room_prv_msg" alter column "chara_image_source_type" type jsonb using ("chara_image_source_type"::jsonb);'
        );
        this.addSql(
            'alter table "room_prv_msg" drop constraint if exists "room_prv_msg_chara_portrait_image_path_check";'
        );
        this.addSql(
            'alter table "room_prv_msg" alter column "chara_portrait_image_path" type varchar using ("chara_portrait_image_path"::varchar);'
        );

        this.addSql('alter table "room_pub_ch" drop constraint "room_pub_ch_room_id_key_unique";');
        this.addSql(
            'alter table "room_pub_ch" add constraint "room_pub_ch_room_id_key_unique" unique ("key", "room_id");'
        );

        this.addSql(
            'alter table "room_pub_msg" drop constraint if exists "room_pub_msg_init_text_source_check";'
        );
        this.addSql(
            'alter table "room_pub_msg" alter column "init_text_source" type varchar using ("init_text_source"::varchar);'
        );
        this.addSql('alter table "room_pub_msg" alter column "init_text_source" set default \'\';');
        this.addSql(
            'alter table "room_pub_msg" drop constraint if exists "room_pub_msg_init_text_check";'
        );
        this.addSql(
            'alter table "room_pub_msg" alter column "init_text" type varchar using ("init_text"::varchar);'
        );
        this.addSql('alter table "room_pub_msg" alter column "init_text" set default \'\';');
        this.addSql('alter table "room_pub_msg" alter column "init_text" set not null;');
        this.addSql(
            'alter table "room_pub_msg" drop constraint if exists "room_pub_msg_updated_text_check";'
        );
        this.addSql(
            'alter table "room_pub_msg" alter column "updated_text" type varchar using ("updated_text"::varchar);'
        );
        this.addSql(
            'alter table "room_pub_msg" drop constraint if exists "room_pub_msg_command_result_check";'
        );
        this.addSql(
            'alter table "room_pub_msg" alter column "command_result" type varchar using ("command_result"::varchar);'
        );
        this.addSql(
            'alter table "room_pub_msg" drop constraint if exists "room_pub_msg_alt_text_to_secret_check";'
        );
        this.addSql(
            'alter table "room_pub_msg" alter column "alt_text_to_secret" type varchar using ("alt_text_to_secret"::varchar);'
        );
        this.addSql(
            'alter table "room_pub_msg" drop constraint if exists "room_pub_msg_chara_image_path_check";'
        );
        this.addSql(
            'alter table "room_pub_msg" alter column "chara_image_path" type varchar using ("chara_image_path"::varchar);'
        );
        this.addSql(
            'alter table "room_pub_msg" drop constraint if exists "room_pub_msg_chara_image_source_type_check";'
        );
        this.addSql(
            'alter table "room_pub_msg" alter column "chara_image_source_type" type varchar using ("chara_image_source_type"::varchar);'
        );
        this.addSql(
            'alter table "room_pub_msg" drop constraint if exists "room_pub_msg_chara_portrait_image_path_check";'
        );
        this.addSql(
            'alter table "room_pub_msg" alter column "chara_portrait_image_path" type varchar using ("chara_portrait_image_path"::varchar);'
        );
    }
}
