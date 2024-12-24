'use strict';

var migrations = require('@mikro-orm/migrations');

class Migration20220502053022 extends migrations.Migration {
    async up() {
        this.addSql('alter table `room` add column `complete_updated_at` datetime null;');
        this.addSql('create index `room_complete_updated_at_index` on `room` (`complete_updated_at`);');
    }
}

exports.Migration20220502053022 = Migration20220502053022;
//# sourceMappingURL=Migration20220502053022.js.map
