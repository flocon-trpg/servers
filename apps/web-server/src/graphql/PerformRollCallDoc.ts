import { graphql } from '../graphql-codegen';

export const PerformRollCallDoc = graphql(`
    mutation PerformRollCall($input: PerformRollCallInput!) {
        result: performRollCall(input: $input) {
            failureType
        }
    }
`);
