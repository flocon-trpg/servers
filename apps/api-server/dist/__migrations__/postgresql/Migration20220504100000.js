'use strict';

var migrations = require('@mikro-orm/migrations');

class Migration20220504100000 extends migrations.Migration {
    async up() {
        this.addSql('create table "user_bookmarked_rooms" ("user_user_uid" varchar(255) not null, "room_id" varchar(255) not null);');
        this.addSql('alter table "user_bookmarked_rooms" add constraint "user_bookmarked_rooms_pkey" primary key ("user_user_uid", "room_id");');
        this.addSql('alter table "user_bookmarked_rooms" add constraint "user_bookmarked_rooms_user_user_uid_foreign" foreign key ("user_user_uid") references "user" ("user_uid") on update cascade on delete cascade;');
        this.addSql('alter table "user_bookmarked_rooms" add constraint "user_bookmarked_rooms_room_id_foreign" foreign key ("room_id") references "room" ("id") on update cascade on delete cascade;');
    }
    async down() {
        this.addSql('drop table if exists "user_bookmarked_rooms" cascade;');
    }
}

exports.Migration20220504100000 = Migration20220504100000;
//# sourceMappingURL=Migration20220504100000.js.map
