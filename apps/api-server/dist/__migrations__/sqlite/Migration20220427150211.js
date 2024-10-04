'use strict';

var migrations = require('@mikro-orm/migrations');

class Migration20220427150211 extends migrations.Migration {
    async up() {
        this.addSql('alter table `room_prv_msg` add column `text_updated_at2` date null default null;');
        this.addSql('alter table `room_pub_msg` add column `text_updated_at2` date null default null;');
    }
}

exports.Migration20220427150211 = Migration20220427150211;
//# sourceMappingURL=Migration20220427150211.js.map
