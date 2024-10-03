'use strict';

var migrations = require('@mikro-orm/migrations');

class Migration20220504095931 extends migrations.Migration {
    async up() {
        this.addSql('create table `user_bookmarked_rooms` (`user_user_uid` text not null, `room_id` text not null, constraint `user_bookmarked_rooms_user_user_uid_foreign` foreign key(`user_user_uid`) references `user`(`user_uid`) on delete cascade on update cascade, constraint `user_bookmarked_rooms_room_id_foreign` foreign key(`room_id`) references `room`(`id`) on delete cascade on update cascade, primary key (`user_user_uid`, `room_id`));');
        this.addSql('create index `user_bookmarked_rooms_user_user_uid_index` on `user_bookmarked_rooms` (`user_user_uid`);');
        this.addSql('create index `user_bookmarked_rooms_room_id_index` on `user_bookmarked_rooms` (`room_id`);');
    }
}

exports.Migration20220504095931 = Migration20220504095931;
//# sourceMappingURL=Migration20220504095931.js.map
