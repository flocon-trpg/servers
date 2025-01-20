import { Migration } from '@mikro-orm/migrations';

export class Migration20250120211353 extends Migration {
    override async up(): Promise<void> {
        this.addSql(
            `alter table \`room_prv_msg\` modify \`chara_image_source_type\` type default null;`,
        );
    }

    override async down(): Promise<void> {
        this.addSql(
            `alter table \`room_prv_msg\` modify \`chara_image_source_type\` varchar(255);`,
        );
    }
}
