import { graphql } from '../graphql-codegen';

export const GetFilesDoc = graphql(`
    query GetFiles($input: GetFilesInput!) {
        result: getFiles(input: $input) {
            files {
                createdAt
                createdBy
                filename
                listType
                screenname
                thumbFilename
            }
        }
    }
`);
