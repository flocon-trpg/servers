import { Migration } from '@mikro-orm/migrations';

export class Migration20210308163813 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "update_chara_op" add column "tachie_image" jsonb null;');

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

    this.addSql('alter table "remove_chara_op" add column "tachie_image_path" varchar(65535) null default null, add column "tachie_image_source_type" text check ("tachie_image_source_type" in (\'Default\', \'FirebaseStorage\')) null default null;');

    this.addSql('create table "removed_tachie_loc" ("id" varchar(255) not null, "board_id" varchar(255) not null, "board_created_by" varchar(255) not null, "is_private" bool not null, "x" int4 not null, "y" int4 not null, "w" int4 not null, "h" int4 not null, "version" int4 not null default 1, "remove_chara_op_id" varchar(255) not null);');
    this.addSql('alter table "removed_tachie_loc" add constraint "removed_tachie_loc_pkey" primary key ("id");');
    this.addSql('create index "removed_tachie_loc_board_id_index" on "removed_tachie_loc" ("board_id");');
    this.addSql('create index "removed_tachie_loc_board_created_by_index" on "removed_tachie_loc" ("board_created_by");');

    this.addSql('alter table "chara" add column "tachie_image_path" varchar(65535) null default null, add column "tachie_image_source_type" text check ("tachie_image_source_type" in (\'Default\', \'FirebaseStorage\')) null default null;');

    this.addSql('create table "tachie_loc" ("id" varchar(255) not null, "board_id" varchar(255) not null, "board_created_by" varchar(255) not null, "is_private" bool not null, "x" int4 not null, "y" int4 not null, "w" int4 not null, "h" int4 not null, "version" int4 not null default 1, "chara_id" varchar(255) not null);');
    this.addSql('alter table "tachie_loc" add constraint "tachie_loc_pkey" primary key ("id");');
    this.addSql('create index "tachie_loc_board_id_index" on "tachie_loc" ("board_id");');
    this.addSql('create index "tachie_loc_board_created_by_index" on "tachie_loc" ("board_created_by");');

    this.addSql('alter table "add_tachie_loc_op" add constraint "add_tachie_loc_op_update_chara_op_id_foreign" foreign key ("update_chara_op_id") references "update_chara_op" ("id") on update cascade;');

    this.addSql('alter table "remove_tachie_loc_op" add constraint "remove_tachie_loc_op_update_chara_op_id_foreign" foreign key ("update_chara_op_id") references "update_chara_op" ("id") on update cascade;');

    this.addSql('alter table "update_tachie_loc_op" add constraint "update_tachie_loc_op_update_chara_op_id_foreign" foreign key ("update_chara_op_id") references "update_chara_op" ("id") on update cascade;');

    this.addSql('alter table "removed_tachie_loc" add constraint "removed_tachie_loc_remove_chara_op_id_foreign" foreign key ("remove_chara_op_id") references "remove_chara_op" ("id") on update cascade;');

    this.addSql('alter table "tachie_loc" add constraint "tachie_loc_chara_id_foreign" foreign key ("chara_id") references "chara" ("id") on update cascade;');

    this.addSql('alter table "removed_my_value_piece_by_partici" drop constraint "removed_my_value_piece_by_partici_board_id_board_created_by_rem";');

    this.addSql('alter table "removed_my_value_piece_by_partici" add constraint "removed_my_value_piece_by_partici_board_id_board_created_by_removed_my_value_id_unique" unique ("board_id", "board_created_by", "removed_my_value_id");');

    this.addSql('alter table "removed_my_value_piece_by_my_value" drop constraint "removed_my_value_piece_by_my_value_board_id_board_created_by_re";');

    this.addSql('alter table "removed_my_value_piece_by_my_value" add constraint "removed_my_value_piece_by_my_value_board_id_board_created_by_remove_my_value_op_id_unique" unique ("board_id", "board_created_by", "remove_my_value_op_id");');

    this.addSql('alter table "add_my_value_piece_op" drop constraint "add_my_value_piece_op_board_id_board_created_by_update_my_value";');

    this.addSql('alter table "add_my_value_piece_op" add constraint "add_my_value_piece_op_board_id_board_created_by_update_my_value_op_id_unique" unique ("board_id", "board_created_by", "update_my_value_op_id");');

    this.addSql('alter table "remove_my_value_piece_op" drop constraint "remove_my_value_piece_op_board_id_board_created_by_update_my_va";');

    this.addSql('alter table "remove_my_value_piece_op" add constraint "remove_my_value_piece_op_board_id_board_created_by_update_my_value_op_id_unique" unique ("board_id", "board_created_by", "update_my_value_op_id");');

    this.addSql('alter table "update_my_value_piece_op" drop constraint "update_my_value_piece_op_board_id_board_created_by_update_my_va";');

    this.addSql('alter table "update_my_value_piece_op" add constraint "update_my_value_piece_op_board_id_board_created_by_update_my_value_op_id_unique" unique ("board_id", "board_created_by", "update_my_value_op_id");');

    this.addSql('alter table "add_chara_piece_op" drop constraint "add_chara_piece_op_update_chara_op_id_board_created_by_board_id";');

    this.addSql('alter table "add_chara_piece_op" add constraint "add_chara_piece_op_update_chara_op_id_board_created_by_board_id_unique" unique ("update_chara_op_id", "board_created_by", "board_id");');

    this.addSql('alter table "remove_chara_piece_op" drop constraint "remove_chara_piece_op_update_chara_op_id_board_created_by_board";');

    this.addSql('alter table "remove_chara_piece_op" add constraint "remove_chara_piece_op_update_chara_op_id_board_created_by_board_id_unique" unique ("update_chara_op_id", "board_created_by", "board_id");');

    this.addSql('alter table "update_chara_piece_op" drop constraint "update_chara_piece_op_update_chara_op_id_board_created_by_board";');

    this.addSql('alter table "update_chara_piece_op" add constraint "update_chara_piece_op_update_chara_op_id_board_created_by_board_id_unique" unique ("update_chara_op_id", "board_created_by", "board_id");');

    this.addSql('alter table "add_tachie_loc_op" add constraint "add_tachie_loc_op_update_chara_op_id_board_created_by_board_id_unique" unique ("update_chara_op_id", "board_created_by", "board_id");');

    this.addSql('alter table "remove_tachie_loc_op" add constraint "remove_tachie_loc_op_update_chara_op_id_board_created_by_board_id_unique" unique ("update_chara_op_id", "board_created_by", "board_id");');

    this.addSql('alter table "update_tachie_loc_op" add constraint "update_tachie_loc_op_update_chara_op_id_board_created_by_board_id_unique" unique ("update_chara_op_id", "board_created_by", "board_id");');

    this.addSql('alter table "removed_chara_piece" drop constraint "removed_chara_piece_remove_chara_op_id_board_created_by_board_i";');

    this.addSql('alter table "removed_chara_piece" add constraint "removed_chara_piece_remove_chara_op_id_board_created_by_board_id_unique" unique ("remove_chara_op_id", "board_created_by", "board_id");');

    this.addSql('alter table "removed_tachie_loc" add constraint "removed_tachie_loc_remove_chara_op_id_board_created_by_board_id_unique" unique ("remove_chara_op_id", "board_created_by", "board_id");');

    this.addSql('alter table "tachie_loc" add constraint "tachie_loc_chara_id_board_created_by_board_id_unique" unique ("chara_id", "board_created_by", "board_id");');
  }

}
