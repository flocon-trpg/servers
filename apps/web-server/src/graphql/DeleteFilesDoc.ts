import { graphql } from '../graphql-codegen';

export const DeleteFilesDoc = graphql(`
    mutation DeleteFiles($filenames: [String!]!) {
        result: deleteFiles(filenames: $filenames)
    }
`);
