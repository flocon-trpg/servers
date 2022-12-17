import * as Doc071 from '@flocon-trpg/typed-document-node-v0.7.1';
import * as Doc072 from '@flocon-trpg/typed-document-node-v0.7.2';
import * as Doc078 from '@flocon-trpg/typed-document-node-v0.7.8';
import { loggerRef } from '@flocon-trpg/utils';
import { AnyVariables, GraphQLRequest } from 'urql';
import { fromValue } from 'wonka';
import { createDummyUrqlOperation, createMockUrqlClient } from '.';

export const createMockUrqlClientForRoomMessage = () => {
    return createMockUrqlClient({
        mockQuery: (query: GraphQLRequest<any, AnyVariables>) => {
            switch (query.query) {
                case Doc071.GetAvailableGameSystemsDocument:
                case Doc072.GetAvailableGameSystemsDocument:
                case Doc078.GetAvailableGameSystemsDocument: {
                    const res: Doc071.GetAvailableGameSystemsQuery = {
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
                case Doc071.GetDiceHelpMessagesDocument:
                case Doc072.GetDiceHelpMessagesDocument:
                case Doc078.GetDiceHelpMessagesDocument: {
                    const res: Doc071.GetDiceHelpMessagesQuery = {
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
