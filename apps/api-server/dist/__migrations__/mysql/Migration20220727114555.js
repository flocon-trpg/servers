'use strict';

var migrations = require('@mikro-orm/migrations');

class Migration20220727114555 extends migrations.Migration {
    async up() {
        this.addSql('alter table `file` drop index `file_screenname_index`;');
        this.addSql('alter table `file` modify `screenname` text null;');
    }
    async down() {
        this.addSql('alter table `file` modify `screenname` varchar(255) not null;');
        this.addSql('alter table `file` add index `file_screenname_index`(`screenname`);');
    }
}

exports.Migration20220727114555 = Migration20220727114555;
//# sourceMappingURL=Migration20220727114555.js.map
