import { Migration } from '@mikro-orm/migrations';

export class Migration20250120211356 extends Migration {
    override async up(): Promise<void> {
        this.addSql(
            `alter table "room" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
        );
        this.addSql(
            `alter table "room" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
        );
        this.addSql(
            `alter table "room" alter column "complete_updated_at" type timestamptz using ("complete_updated_at"::timestamptz);`,
        );

        this.addSql(
            `alter table "dice_piece_log" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
        );

        this.addSql(
            `alter table "room_op" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
        );

        this.addSql(
            `alter table "room_pub_ch" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
        );

        this.addSql(
            `alter table "string_piece_log" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
        );

        this.addSql(
            `alter table "room_se" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
        );

        this.addSql(
            `alter table "room_pub_msg" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
        );
        this.addSql(
            `alter table "room_pub_msg" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
        );
        this.addSql(
            `alter table "room_pub_msg" alter column "text_updated_at3" type timestamptz using ("text_updated_at3"::timestamptz);`,
        );

        this.addSql(
            `alter table "room_prv_msg" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
        );
        this.addSql(
            `alter table "room_prv_msg" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
        );
        this.addSql(
            `alter table "room_prv_msg" alter column "chara_image_source_type" type type using ("chara_image_source_type"::type);`,
        );
        this.addSql(
            `alter table "room_prv_msg" alter column "text_updated_at3" type timestamptz using ("text_updated_at3"::timestamptz);`,
        );

        this.addSql(
            `alter table "file" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
        );
    }

    override async down(): Promise<void> {
        this.addSql(
            `alter table "dice_piece_log" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));`,
        );

        this.addSql(
            `alter table "file" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));`,
        );

        this.addSql(
            `alter table "room" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));`,
        );
        this.addSql(
            `alter table "room" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));`,
        );
        this.addSql(
            `alter table "room" alter column "complete_updated_at" type timestamptz(0) using ("complete_updated_at"::timestamptz(0));`,
        );

        this.addSql(
            `alter table "room_op" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));`,
        );

        this.addSql(
            `alter table "room_prv_msg" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));`,
        );
        this.addSql(
            `alter table "room_prv_msg" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));`,
        );
        this.addSql(
            `alter table "room_prv_msg" alter column "text_updated_at3" type timestamptz(0) using ("text_updated_at3"::timestamptz(0));`,
        );
        this.addSql(
            `alter table "room_prv_msg" alter column "chara_image_source_type" type varchar(255) using ("chara_image_source_type"::varchar(255));`,
        );

        this.addSql(
            `alter table "room_pub_ch" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));`,
        );

        this.addSql(
            `alter table "room_pub_msg" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));`,
        );
        this.addSql(
            `alter table "room_pub_msg" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));`,
        );
        this.addSql(
            `alter table "room_pub_msg" alter column "text_updated_at3" type timestamptz(0) using ("text_updated_at3"::timestamptz(0));`,
        );

        this.addSql(
            `alter table "room_se" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));`,
        );

        this.addSql(
            `alter table "string_piece_log" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));`,
        );
    }
}
