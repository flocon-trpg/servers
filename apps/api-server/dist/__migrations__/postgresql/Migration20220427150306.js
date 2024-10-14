'use strict';

var migrations = require('@mikro-orm/migrations');

class Migration20220427150306 extends migrations.Migration {
    async up() {
        this.addSql('alter table "room_prv_msg" add column "text_updated_at2" date null default null;');
        this.addSql('alter table "room_pub_msg" add column "text_updated_at2" date null default null;');
    }
    async down() {
        this.addSql('alter table "room_prv_msg" drop column "text_updated_at2";');
        this.addSql('alter table "room_pub_msg" drop column "text_updated_at2";');
    }
}

exports.Migration20220427150306 = Migration20220427150306;
//# sourceMappingURL=Migration20220427150306.js.map
