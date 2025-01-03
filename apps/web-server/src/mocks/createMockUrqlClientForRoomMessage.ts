import * as Doc from '@flocon-trpg/typed-document-node';
import { loggerRef } from '@flocon-trpg/utils';
import { AnyVariables, GraphQLRequest } from 'urql';
import { fromValue } from 'wonka';
import { withPromise } from './withPromise';
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
                    return withPromise(
                        fromValue({
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                            data: res as any,
                            operation: createDummyUrqlOperation(),
                            stale: false,
                            hasNext: false,
                        }),
                    );
                }
                case Doc.GetDiceHelpMessagesDocument: {
                    const res: Doc.GetDiceHelpMessagesQuery = {
                        __typename: 'Query',
                        result: 'Test DiceHelpMessage',
                    };
                    return withPromise(
                        fromValue({
                            data: res,
                            operation: createDummyUrqlOperation(),
                            stale: false,
                            hasNext: false,
                        }),
                    );
                }
                case Doc.GetRoomAsListItemDocument: {
                    const res: Doc.GetRoomAsListItemQuery = {
                        __typename: 'Query',
                        result: {
                            __typename: 'GetRoomAsListItemSuccessResult',
                            room: {
                                __typename: 'RoomAsListItem',
                                id: 'test-id',
                                name: 'test-name',
                                createdBy: 'test-createdBy',
                                createdAt: 1704034800,
                                updatedAt: 1704038400,
                                role: Doc.ParticipantRole.Player,
                                isBookmarked: false,
                                requiresPlayerPassword: false,
                                requiresSpectatorPassword: false,
                            },
                        },
                    };
                    return withPromise(
                        fromValue({
                            data: res,
                            operation: createDummyUrqlOperation(),
                            stale: false,
                            hasNext: false,
                        }),
                    );
                }
                default:
                    loggerRef.error({ query: query.query }, 'Query');
                    throw new Error('Query not match');
            }
        },
    });
};
