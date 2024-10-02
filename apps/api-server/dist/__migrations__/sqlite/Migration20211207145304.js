'use strict';

var migrations = require('@mikro-orm/migrations');

class Migration20211207145304 extends migrations.Migration {
    async up() {
        this.addSql('alter table `room_op` add column `created_at` datetime null default null;');
        this.addSql('create index `room_op_created_at_index` on `room_op` (`created_at`);');
    }
}

exports.Migration20211207145304 = Migration20211207145304;
//# sourceMappingURL=Migration20211207145304.js.map
