import 'reflect-metadata';
import { buildSchemaSync } from './src/buildSchema';
import registerEnumTypes from './src/graphql+mikro-orm/registerEnumTypes';

console.log('building GraphQL schema...');

registerEnumTypes();
buildSchemaSync({ emitSchemaFile: true });

console.log('building GraphQL schema is successfully finished.');