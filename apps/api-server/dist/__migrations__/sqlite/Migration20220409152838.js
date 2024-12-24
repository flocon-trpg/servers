'use strict';

var migrations = require('@mikro-orm/migrations');
var migrations$1 = require('../../api-server/src/utils/migrations.js');

class Migration20220409152838 extends migrations.Migration {
    async up() {
        migrations$1.alterColumnToText({
            tableName: 'room_prv_msg',
            columnName: 'init_text_source',
            self: this,
        });
        migrations$1.alterColumnToText({
            tableName: 'room_prv_msg',
            columnName: 'init_text',
            self: this,
        });
        migrations$1.alterColumnToText({
            tableName: 'room_pub_msg',
            columnName: 'init_text_source',
            self: this,
        });
        migrations$1.alterColumnToText({
            tableName: 'room_pub_msg',
            columnName: 'init_text',
            self: this,
        });
    }
}

exports.Migration20220409152838 = Migration20220409152838;
//# sourceMappingURL=Migration20220409152838.js.map
