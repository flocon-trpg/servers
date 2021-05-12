import { Migration } from '@mikro-orm/migrations';

export class Migration20210511150907 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `update_chara_op` add column `private_var_toml` varchar null;');
  }

}
