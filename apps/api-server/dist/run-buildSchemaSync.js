'use strict';

require('reflect-metadata');
var buildSchema = require('./buildSchema.js');
var registerEnumTypes = require('./graphql/registerEnumTypes.js');

console.log('building GraphQL schema...');
registerEnumTypes.registerEnumTypes();
buildSchema.buildSchemaSync(buildSchema.noAuthCheck)({ emitSchemaFile: true });
//# sourceMappingURL=run-buildSchemaSync.js.map
