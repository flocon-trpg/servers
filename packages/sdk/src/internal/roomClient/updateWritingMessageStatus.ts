import { WritingMessageStatusInputType } from '@flocon-trpg/typed-document-node';
import { Subject, bufferTime, mergeMap } from 'rxjs';
import { GraphQLClientWithStatus } from './graphqlClient';

const bufferTimeValue = 1500;

export const updateWritingMessageStatus = <TGraphQLError>(
    client: Pick<GraphQLClientWithStatus<TGraphQLError>, 'updateWritingMessagesStatusMutation'>,
) => {
    const subject = new Subject<WritingMessageStatusInputType>();
    const next = (inputType: WritingMessageStatusInputType) => {
        subject.next(inputType);
    };
    const subscription = subject
        .pipe(
            bufferTime(bufferTimeValue),
            mergeMap(items => {
                const lastElement = items[items.length - 1];
                if (lastElement == null) {
                    return [];
                }
                return client.updateWritingMessagesStatusMutation({ newStatus: lastElement });
            }),
        )
        .subscribe();
    return { next, unsubscribe: () => subscription.unsubscribe() };
};
