import { Migration } from '@mikro-orm/migrations';

export class Migration20210511040556 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `remove_chara_op` add column `private_var_toml` varchar null default null;');

    this.addSql('alter table `chara` add column `private_var_toml` varchar null default null;');
  }

}
