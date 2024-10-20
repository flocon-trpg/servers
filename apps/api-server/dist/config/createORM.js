'use strict';

var result = require('@kizahasi/result');
var core = require('@mikro-orm/core');
var appConsole = require('../utils/appConsole.js');

const createORM = async (options) => {
    if (options.isError) {
        return options;
    }
    try {
        const result$1 = await core.MikroORM.init(options.value);
        return result.Result.ok(result$1);
    }
    catch (e) {
        appConsole.AppConsole.error({
            en: 'Could not connect to the database!',
            ja: 'データベースに接続できませんでした',
        });
        throw e;
    }
};

exports.createORM = createORM;
//# sourceMappingURL=createORM.js.map
