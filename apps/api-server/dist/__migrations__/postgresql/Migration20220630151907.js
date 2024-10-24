'use strict';

var migrations = require('@mikro-orm/migrations');

class Migration20220630151907 extends migrations.Migration {
    async up() {
        this.addSql('alter table "room_prv_msg" add column "text_updated_at3" timestamptz(0) null default null;');
        this.addSql('alter table "room_pub_msg" add column "text_updated_at3" timestamptz(0) null default null;');
    }
    async down() {
        this.addSql('alter table "room_prv_msg" drop column "text_updated_at3";');
        this.addSql('alter table "room_pub_msg" drop column "text_updated_at3";');
    }
}

exports.Migration20220630151907 = Migration20220630151907;
//# sourceMappingURL=Migration20220630151907.js.map
