'use strict';

var migrations = require('@mikro-orm/migrations');

class Migration20220630151831 extends migrations.Migration {
    async up() {
        this.addSql('alter table `room_prv_msg` add column `text_updated_at3` datetime null default null;');
        this.addSql('alter table `room_pub_msg` add column `text_updated_at3` datetime null default null;');
    }
}

exports.Migration20220630151831 = Migration20220630151831;
//# sourceMappingURL=Migration20220630151831.js.map
