'use strict';

var migrations = require('@mikro-orm/migrations');

class Migration20220727114405 extends migrations.Migration {
    async up() {
        this.addSql('drop index "file_screenname_index";');
        this.addSql('alter table "file" alter column "screenname" type text using ("screenname"::text);');
        this.addSql('alter table "file" alter column "screenname" drop not null;');
    }
    async down() {
        this.addSql('alter table "file" alter column "screenname" type varchar(255) using ("screenname"::varchar(255));');
        this.addSql('alter table "file" alter column "screenname" set not null;');
        this.addSql('create index "file_screenname_index" on "file" ("screenname");');
    }
}

exports.Migration20220727114405 = Migration20220727114405;
//# sourceMappingURL=Migration20220727114405.js.map
