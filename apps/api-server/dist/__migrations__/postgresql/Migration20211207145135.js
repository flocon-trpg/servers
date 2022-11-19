'use strict';

var migrations = require('@mikro-orm/migrations');

class Migration20211207145135 extends migrations.Migration {
    async up() {
        this.addSql('alter table "room_op" add column "created_at" timestamptz(0) null default null;');
        this.addSql('create index "room_op_created_at_index" on "room_op" ("created_at");');
    }
}

exports.Migration20211207145135 = Migration20211207145135;
//# sourceMappingURL=Migration20211207145135.js.map
