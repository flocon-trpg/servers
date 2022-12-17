import * as Doc071 from '@flocon-trpg/typed-document-node-v0.7.1';
import * as Doc072 from '@flocon-trpg/typed-document-node-v0.7.2';
import { loggerRef } from '@flocon-trpg/utils';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { Client, CombinedError } from 'urql';
import { fromValue, never } from 'wonka';
import { IndexPage } from './IndexPage';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
import { createDummyUrqlOperation, createMockUrqlClient } from '@/mocks';

type Version = Doc071.GetServerInfoQuery['result']['version'];

const createMockClient = (version: Version | 'error' | 'never'): Client => {
    return createMockUrqlClient({
        mockQuery: query => {
            switch (version) {
                case 'never':
                    return never;
                case 'error':
                    return fromValue({
                        error: new CombinedError({ graphQLErrors: ['test error'] }),
                        operation: createDummyUrqlOperation(),
                    });
                default:
                    break;
            }
            switch (query.query) {
                case Doc071.GetServerInfoDocument:
                case Doc072.GetServerInfoDocument: {
                    const res: Doc071.GetServerInfoQuery = {
                        __typename: 'Query',
                        result: {
                            __typename: 'ServerInfo',
                            uploaderEnabled: false,
                            version,
                        },
                    };
                    return fromValue({
                        data: res,
                        operation: createDummyUrqlOperation(),
                    });
                }
                case Doc072.GetMyRolesDocument: {
                    const res: Doc072.GetMyRolesQuery = {
                        __typename: 'Query',
                        result: {
                            __typename: 'Roles',
                            admin: false,
                        },
                    };
                    return fromValue({
                        data: res,
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

export const Default: React.FC<{ version: Version | 'error' | 'never' }> = ({ version }) => {
    const urqlClient = React.useMemo(() => createMockClient(version), [version]);
    return (
        <StorybookProvider waitForRoomClient={false} urqlClient={urqlClient}>
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
        prerelease: { type: Doc071.PrereleaseType.Alpha, version: 1 },
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
