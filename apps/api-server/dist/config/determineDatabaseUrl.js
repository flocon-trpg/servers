'use strict';

var result = require('@kizahasi/result');
var types = require('./types.js');

const determineDatabaseUrl = (DATABASE_URL) => {
    const [protocol, hierPart] = DATABASE_URL.trim().split('://');
    if (protocol == null || hierPart == null) {
        return result.Result.error({ en: 'Could not determine database. URL is invalid.' });
    }
    switch (protocol) {
        case 'postgres':
        case 'postgresql':
            return result.Result.ok({ type: types.postgresql, postgresql: { clientUrl: DATABASE_URL } });
        case 'file':
        case 'sqlite':
            return result.Result.ok({
                type: types.sqlite,
                sqlite: { dbName: hierPart },
            });
    }
    if (protocol.startsWith('mysql')) {
        return result.Result.ok({ type: types.mysql, mysql: { clientUrl: DATABASE_URL } });
    }
    return result.Result.error({
        en: 'Could not determine database. To use PostgreSQL, start with postgres:// or postgresql://. To use MySQL, start with mysql://. To use SQLite, start with file:// .',
    });
};

exports.determineDatabaseUrl = determineDatabaseUrl;
//# sourceMappingURL=determineDatabaseUrl.js.map
