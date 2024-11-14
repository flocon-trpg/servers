'use strict';

const alterColumnToText = ({ tableName, columnName, self, }) => {
    self.addSql(`alter table \`${tableName}\` add column \`${columnName}_temp\` text null default null;`);
    self.addSql(`update \`${tableName}\` set \`${columnName}_temp\` = \`${columnName}\`;`);
    self.addSql(`alter table \`${tableName}\` drop column \`${columnName}\`;`);
    self.addSql(`alter table \`${tableName}\` add column \`${columnName}\` text null default null;`);
    self.addSql(`update \`${tableName}\` set \`${columnName}\` = \`${columnName}_temp\`;`);
    self.addSql(`alter table \`${tableName}\` drop column \`${columnName}_temp\`;`);
};

exports.alterColumnToText = alterColumnToText;
//# sourceMappingURL=migrations.js.map
