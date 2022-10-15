import 'reflect-metadata';
import { buildSchemaSync, noAuthCheck } from './src/buildSchema';
import { registerEnumTypes } from './src/graphql/registerEnumTypes';

console.log('building GraphQL schema...');

registerEnumTypes();
buildSchemaSync(noAuthCheck)({ emitSchemaFile: true });
