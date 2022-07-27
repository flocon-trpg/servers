import { Migration } from '@mikro-orm/migrations';
import { alterColumnToText } from '../../utils/migrations';

export class Migration20220409152838 extends Migration {
    async up(): Promise<void> {
        alterColumnToText({
            tableName: 'room_prv_msg',
            columnName: 'init_text_source',
            self: this,
        });
        alterColumnToText({
            tableName: 'room_prv_msg',
            columnName: 'init_text',
            self: this,
        });
        alterColumnToText({
            tableName: 'room_pub_msg',
            columnName: 'init_text_source',
            self: this,
        });
        alterColumnToText({
            tableName: 'room_pub_msg',
            columnName: 'init_text',
            self: this,
        });
    }
}
