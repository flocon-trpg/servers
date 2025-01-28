import { graphql } from '../graphql-codegen';

export const AnswerRollCallDoc = graphql(`
    mutation AnswerRollCall($roomId: String!, $rollCallId: String!, $answer: Boolean!) {
        result: answerRollCall(roomId: $roomId, rollCallId: $rollCallId, answer: $answer) {
            failureType
        }
    }
`);
