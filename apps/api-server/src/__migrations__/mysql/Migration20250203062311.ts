import { Migration } from '@mikro-orm/migrations';

export class Migration20250203062311 extends Migration {
    override async up(): Promise<void> {
        this.addSql(
            `alter table \`room_prv_msg\` modify \`chara_image_source_type\` text default null;`,
        );
    }

    override async down(): Promise<void> {
        this.addSql(
            `alter table \`room_prv_msg\` modify \`chara_image_source_type\` varchar(255) default null;`,
        );
    }
}
