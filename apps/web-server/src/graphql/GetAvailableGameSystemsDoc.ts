import { graphql } from '../graphql-codegen';

export const GetAvailableGameSystemsDoc = graphql(`
    query GetAvailableGameSystems {
        result: getAvailableGameSystems {
            value {
                id
                name
                sortKey
            }
        }
    }
`);
