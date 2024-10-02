import { Migration } from '@mikro-orm/migrations';

// SQLiteで、指定したColumnをtext null default nullに変換する。マイグレーションで用いる。
// mikro-ormではDEFAULT制約を変更するマイグレーションを生成できないため、手動で書いたコード。
export const alterColumnToText = ({
    tableName,
    columnName,
    self,
}: {
    tableName: string;
    columnName: string;
    self: Migration;
}) => {
    self.addSql(
        `alter table \`${tableName}\` add column \`${columnName}_temp\` text null default null;`,
    );
    self.addSql(`update \`${tableName}\` set \`${columnName}_temp\` = \`${columnName}\`;`);
    self.addSql(`alter table \`${tableName}\` drop column \`${columnName}\`;`);
    self.addSql(
        `alter table \`${tableName}\` add column \`${columnName}\` text null default null;`,
    );
    self.addSql(`update \`${tableName}\` set \`${columnName}\` = \`${columnName}_temp\`;`);
    self.addSql(`alter table \`${tableName}\` drop column \`${columnName}_temp\`;`);
};
