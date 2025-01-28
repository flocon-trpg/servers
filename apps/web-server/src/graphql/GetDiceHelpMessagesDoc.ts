import { graphql } from '../graphql-codegen';

export const GetDiceHelpMessagesDoc = graphql(`
    query GetDiceHelpMessages($gameSystemId: String!) {
        result: getDiceHelpMessage(gameSystemId: $gameSystemId)
    }
`);
