import * as Doc from '@flocon-trpg/typed-document-node';
import { loggerRef } from '@flocon-trpg/utils';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { Client, CombinedError } from 'urql';
import { fromValue, never } from 'wonka';
import { IndexPage } from './IndexPage';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
import { createDummyUrqlOperation, createMockUrqlClient } from '@/mocks';
import { withPromise } from '@/mocks/withPromise';

type Version = Doc.GetServerInfoQuery['result']['version'];

const createMockClient = (version: Version | 'error' | 'never'): Client => {
    return createMockUrqlClient({
        mockQuery: query => {
            switch (version) {
                case 'never':
                    return withPromise(never);
                case 'error':
                    return withPromise(
                        fromValue({
                            error: new CombinedError({ graphQLErrors: ['test error'] }),
                            operation: createDummyUrqlOperation(),
                            stale: false,
                            hasNext: false,
                        }),
                    );
                default:
                    break;
            }
            switch (query.query) {
                case Doc.GetServerInfoDocument: {
                    const res: Doc.GetServerInfoQuery = {
                        __typename: 'Query',
                        result: {
                            __typename: 'ServerInfo',
                            uploaderEnabled: false,
                            version,
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
                case Doc.GetMyRolesDocument: {
                    const res: Doc.GetMyRolesQuery = {
                        __typename: 'Query',
                        result: {
                            __typename: 'Roles',
                            admin: false,
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

export const Default: React.FC<{ version: Version | 'error' | 'never' }> = ({ version }) => {
    const urqlClient = React.useMemo(() => createMockClient(version), [version]);
    return (
        <StorybookProvider compact={false} roomClientContextValue={null} urqlClient={urqlClient}>
            <IndexPage />
        </StorybookProvider>
    );
};

export default {
    title: 'Pages/Index',
    component: Default,
    args: {
        version: { major: 0, minor: 7, patch: 100 },
    },
} as ComponentMeta<typeof Default>;

const Template: ComponentStory<typeof Default> = args => <Default {...args} />;

export const Loading = Template.bind({});
Loading.args = {
    version: 'never',
};

export const GraphQLError = Template.bind({});
GraphQLError.args = {
    version: 'error',
};

export const Prerelease = Template.bind({});
Prerelease.args = {
    version: {
        major: 0,
        minor: 7,
        patch: 100,
        prerelease: { type: Doc.PrereleaseType.Alpha, version: 1 },
    },
};

export const OutOfRange = Template.bind({});
OutOfRange.args = {
    version: {
        major: 1000,
        minor: 0,
        patch: 0,
    },
};
