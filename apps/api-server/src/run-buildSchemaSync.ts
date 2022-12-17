/* eslint-disable no-console */
import 'reflect-metadata';
import { buildSchemaSync, noAuthCheck } from './buildSchema';
import { registerEnumTypes } from './graphql/registerEnumTypes';

console.log('building GraphQL schema...');

registerEnumTypes();
buildSchemaSync(noAuthCheck)({ emitSchemaFile: true });
