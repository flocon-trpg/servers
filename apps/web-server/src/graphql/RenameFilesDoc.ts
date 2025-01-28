import { graphql } from '../graphql-codegen';

export const RenameFilesDoc = graphql(`
    mutation RenameFiles($input: [RenameFileInput!]!) {
        result: renameFiles(input: $input)
    }
`);
