import { Migration } from '@mikro-orm/migrations';

export class Migration20210821175503 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `file` (`filename` varchar not null, `created_at` datetime null, `screenname` varchar not null, `encoding` varchar not null, `size` integer not null, `thumb_filename` varchar null, `mimetype` varchar not null, `filesize` integer not null, `list_permission` varchar not null, `rename_permission` varchar not null, `delete_permission` varchar not null, primary key (`filename`));');
    this.addSql('create index `file_created_at_index` on `file` (`created_at`);');
    this.addSql('create index `file_screenname_index` on `file` (`screenname`);');
    this.addSql('create index `file_thumb_filename_index` on `file` (`thumb_filename`);');
    this.addSql('create index `file_mimetype_index` on `file` (`mimetype`);');
    this.addSql('create index `file_filesize_index` on `file` (`filesize`);');
    this.addSql('create index `file_list_permission_index` on `file` (`list_permission`);');
    this.addSql('create index `file_rename_permission_index` on `file` (`rename_permission`);');
    this.addSql('create index `file_delete_permission_index` on `file` (`delete_permission`);');

    this.addSql('alter table `file` add column `created_by_user_uid` varchar null;');
    this.addSql('create index `file_created_by_user_uid_index` on `file` (`created_by_user_uid`);');
  }

}
