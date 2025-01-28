import { loggerRef } from '@flocon-trpg/utils';
import { ResultOf } from '@graphql-typed-document-node/core';
import { AnyVariables, GraphQLRequest } from 'urql';
import { fromValue } from 'wonka';
import { GetAvailableGameSystemsDoc } from '../graphql/GetAvailableGameSystemsDoc';
import { GetDiceHelpMessagesDoc } from '../graphql/GetDiceHelpMessagesDoc';
import { GetRoomAsListItemDoc } from '../graphql/GetRoomAsListItemDoc';
import { ParticipantRole } from '../graphql-codegen/graphql';
import { withPromise } from './withPromise';
import { createDummyUrqlOperation, createMockUrqlClient } from '.';

export const createMockUrqlClientForRoomMessage = () => {
    return createMockUrqlClient({
        mockQuery: (query: GraphQLRequest<any, AnyVariables>) => {
            switch (query.query) {
                case GetAvailableGameSystemsDoc: {
                    const res: ResultOf<typeof GetAvailableGameSystemsDoc> = {
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
                case GetDiceHelpMessagesDoc: {
                    const res: ResultOf<typeof GetDiceHelpMessagesDoc> = {
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
                case GetRoomAsListItemDoc: {
                    const res: ResultOf<typeof GetRoomAsListItemDoc> = {
                        __typename: 'Query',
                        result: {
                            __typename: 'GetRoomAsListItemSuccessResult',
                            room: {
                                __typename: 'RoomAsListItem',
                                roomId: 'test-id',
                                name: 'test-name',
                                createdBy: 'test-createdBy',
                                createdAt: 1704034800,
                                updatedAt: 1704038400,
                                role: ParticipantRole.Player,
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
