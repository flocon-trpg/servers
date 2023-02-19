import * as Doc from '@flocon-trpg/typed-document-node';
import { loggerRef } from '@flocon-trpg/utils';
import { AnyVariables, GraphQLRequest } from 'urql';
import { fromValue } from 'wonka';
import { createDummyUrqlOperation, createMockUrqlClient } from '.';

export const createMockUrqlClientForRoomMessage = () => {
    return createMockUrqlClient({
        mockQuery: (query: GraphQLRequest<any, AnyVariables>) => {
            switch (query.query) {
                case Doc.GetAvailableGameSystemsDocument: {
                    const res: Doc.GetAvailableGameSystemsQuery = {
                        __typename: 'Query',
                        result: {
                            __typename: 'GetAvailableGameSystemsResult',
                            value: [
                                {
                                    __typename: 'AvailableGameSystem',
                                    id: 'test-id-1',
                                    name: 'test-name-1',
                                    sortKey: 'test-sortkey-1',
                                },
                                {
                                    __typename: 'AvailableGameSystem',
                                    id: 'test-id-2',
                                    name: 'test-name-2',
                                    sortKey: 'test-sortkey-2',
                                },
                            ],
                        },
                    };
                    return fromValue({
                        data: res,
                        operation: createDummyUrqlOperation(),
                    });
                }
                case Doc.GetDiceHelpMessagesDocument: {
                    const res: Doc.GetDiceHelpMessagesQuery = {
                        __typename: 'Query',
                        result: 'Test DiceHelpMessage',
                    };
                    return fromValue({
                        data: res as any,
                        operation: createDummyUrqlOperation(),
                    });
                }
                default:
                    loggerRef.error({ query: query.query }, 'Query');
                    throw new Error('Query not match');
            }
        },
    });
};
