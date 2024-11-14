'use strict';

require('reflect-metadata');
var buildSchema = require('./api-server/src/buildSchema.js');
var registerEnumTypes = require('./api-server/src/graphql/registerEnumTypes.js');

console.log('building GraphQL schema...');
registerEnumTypes.registerEnumTypes();
buildSchema.buildSchemaSync(buildSchema.noAuthCheck)({ emitSchemaFile: true });
//# sourceMappingURL=run-buildSchemaSync.js.map
