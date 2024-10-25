'use strict';

var migrations = require('@mikro-orm/migrations');

class Migration20220502053137 extends migrations.Migration {
    async up() {
        this.addSql('alter table `room` add `complete_updated_at` datetime null;');
        this.addSql('alter table `room` add index `room_complete_updated_at_index`(`complete_updated_at`);');
    }
    async down() {
        this.addSql('alter table `room` drop index `room_complete_updated_at_index`;');
        this.addSql('alter table `room` drop `complete_updated_at`;');
    }
}

exports.Migration20220502053137 = Migration20220502053137;
//# sourceMappingURL=Migration20220502053137.js.map
