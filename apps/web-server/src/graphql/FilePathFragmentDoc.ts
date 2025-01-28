import { graphql } from '../graphql-codegen';

export const FilePathFragmentDoc = graphql(`
    fragment FilePath on FilePath {
        sourceType
        path
    }
`);
