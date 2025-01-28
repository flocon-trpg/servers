import { WritingMessageStatusInputType } from '@flocon-trpg/graphql-documents';
import { GraphQLClientWithStatus } from './graphqlClient';
export declare const updateWritingMessageStatus: <TGraphQLError>(client: Pick<GraphQLClientWithStatus<TGraphQLError>, "updateWritingMessagesStatusMutation">) => {
    next: (inputType: WritingMessageStatusInputType) => void;
    unsubscribe: () => void;
};
//# sourceMappingURL=updateWritingMessageStatus.d.ts.map