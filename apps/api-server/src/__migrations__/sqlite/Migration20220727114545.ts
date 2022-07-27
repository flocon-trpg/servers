import { Migration } from '@mikro-orm/migrations';
import { alterColumnToText } from '../../utils/migrations';

export class Migration20220727114545 extends Migration {
    async up(): Promise<void> {
        this.addSql('drop index `file_screenname_index`;');

        alterColumnToText({
            tableName: 'file',
            columnName: 'screenname',
            self: this,
        });
    }
}
