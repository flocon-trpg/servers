import { graphql } from '../graphql-codegen';

export const GetDiceHelpMessagesDoc = graphql(`
    query GetDiceHelpMessages($id: String!) {
        result: getDiceHelpMessage(id: $id)
    }
`);
