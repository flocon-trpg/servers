import 'reflect-metadata';
import { buildSchemaSync, noAuthCheck } from './src/buildSchema';
import { registerEnumTypes } from './src/graphql+mikro-orm/registerEnumTypes';

console.log('building GraphQL schema...');

registerEnumTypes();
buildSchemaSync(noAuthCheck)({ emitSchemaFile: true });
