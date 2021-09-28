import { Migration } from '@mikro-orm/migrations';

export class Migration20210928142420 extends Migration {
    async up(): Promise<void> {
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
            'alter table "string_piece_value_log" add constraint "string_piece_value_log_room_id_foreign" foreign key ("room_id") references "room" ("id") on update cascade;'
        );

        this.addSql('drop table if exists "number_piece_value_log" cascade;');
    }
}
