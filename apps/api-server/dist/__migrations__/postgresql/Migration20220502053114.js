'use strict';

var migrations = require('@mikro-orm/migrations');

class Migration20220502053114 extends migrations.Migration {
    async up() {
        this.addSql('alter table "room" add column "complete_updated_at" timestamptz(0) null;');
        this.addSql('create index "room_complete_updated_at_index" on "room" ("complete_updated_at");');
    }
    async down() {
        this.addSql('drop index "room_complete_updated_at_index";');
        this.addSql('alter table "room" drop column "complete_updated_at";');
    }
}

exports.Migration20220502053114 = Migration20220502053114;
//# sourceMappingURL=Migration20220502053114.js.map
