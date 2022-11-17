'use strict';

var result = require('@kizahasi/result');
var types = require('./types.js');

const determineDatabaseUrl = (DATABASE_URL) => {
    const protocol = DATABASE_URL.split('://')[0];
    switch (protocol) {
        case undefined:
            return result.Result.error({ en: 'Could not determine database. URL is invalid.' });
        case 'postgres':
        case 'postgresql':
            return result.Result.ok({ type: types.postgresql, postgresql: { clientUrl: DATABASE_URL } });
        case 'file':
        case 'sqlite':
            return result.Result.ok({
                type: types.sqlite,
                sqlite: { clientUrl: DATABASE_URL },
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
