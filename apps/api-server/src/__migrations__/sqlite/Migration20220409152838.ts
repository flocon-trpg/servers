import { Migration } from '@mikro-orm/migrations';

// mikro-ormではDEFAULT制約を変更するマイグレーションを生成できないため、手動で書いたコード
export class Migration20220409152838 extends Migration {
    replaceTextColumn({ tableName, columnName }: { tableName: string; columnName: string }) {
        this.addSql(
            `alter table \`${tableName}\` add column \`${columnName}_temp\` text null default null;`
        );
        this.addSql(`update \`${tableName}\` set \`${columnName}_temp\` = \`${columnName}\`;`);
        this.addSql(`alter table \`${tableName}\` drop column \`${columnName}\`;`);
        this.addSql(
            `alter table \`${tableName}\` add column \`${columnName}\` text null default null;`
        );
        this.addSql(`update \`${tableName}\` set \`${columnName}\` = \`${columnName}_temp\`;`);
        this.addSql(`alter table \`${tableName}\` drop column \`${columnName}_temp\`;`);
    }

    async up(): Promise<void> {
        this.replaceTextColumn({ tableName: 'room_prv_msg', columnName: 'init_text_source' });
        this.replaceTextColumn({ tableName: 'room_prv_msg', columnName: 'init_text' });
        this.replaceTextColumn({ tableName: 'room_pub_msg', columnName: 'init_text_source' });
        this.replaceTextColumn({ tableName: 'room_pub_msg', columnName: 'init_text' });
    }
}
