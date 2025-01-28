import { loggerRef } from '@flocon-trpg/utils';
import { ResultOf } from '@graphql-typed-document-node/core';
import { Client } from 'urql';
import { fromValue } from 'wonka';
import { GetMyRolesDoc } from '../graphql/GetMyRolesDoc';
import { withPromise } from './withPromise';
import { createDummyUrqlOperation, createMockUrqlClient } from '.';

export const createMockUrqlClientForLayout = (): Client => {
    return createMockUrqlClient({
        mockQuery: query => {
            switch (query.query) {
                case GetMyRolesDoc: {
                    const res: ResultOf<typeof GetMyRolesDoc> = {
                        __typename: 'Query',
                        result: {
                            __typename: 'Roles',
                            admin: false,
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
                default:
                    loggerRef.error({ query: query.query }, 'Query');
                    throw new Error('Query not match');
            }
        },
    });
};
