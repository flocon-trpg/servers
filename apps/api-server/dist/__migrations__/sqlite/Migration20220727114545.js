'use strict';

var migrations = require('@mikro-orm/migrations');
var migrations$1 = require('../../api-server/src/utils/migrations.js');

class Migration20220727114545 extends migrations.Migration {
    async up() {
        this.addSql('drop index `file_screenname_index`;');
        migrations$1.alterColumnToText({
            tableName: 'file',
            columnName: 'screenname',
            self: this,
        });
    }
}

exports.Migration20220727114545 = Migration20220727114545;
//# sourceMappingURL=Migration20220727114545.js.map
