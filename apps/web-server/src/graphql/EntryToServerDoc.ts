import { graphql } from '../graphql-codegen';

export const EntryToServerDoc = graphql(`
    mutation EntryToServer($password: String) {
        result: entryToServer(password: $password) {
            type
        }
    }
`);
