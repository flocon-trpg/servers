import { graphql } from '../graphql-codegen';

export const GetMyRolesDoc = graphql(`
    query GetMyRoles {
        result: getMyRoles {
            admin
        }
    }
`);
