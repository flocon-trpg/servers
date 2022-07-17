import React from 'react';
import { Client, Provider } from 'urql';
import { IndexPage } from './IndexPage';
import { fromValue, never } from 'wonka';
import * as Doc071 from '@flocon-trpg/typed-document-node-v0.7.1';
import * as Doc072 from '@flocon-trpg/typed-document-node-v0.7.2';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { createMockUrqlClient, dummyUrqlOperation } from '@/mocks';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';

type Version = Doc071.GetServerInfoQuery['result']['version'];

const createMockClient = (version: Version | 'never'): Client => {
    return createMockUrqlClient({
        mockQuery: query => {
            if (version === 'never') {
                return never;
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
                        data: res as any,
                        operation: dummyUrqlOperation,
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
                        data: res as any,
                        operation: dummyUrqlOperation,
                    });
                }
                default:
                    console.error('Query', query.query);
                    throw new Error('Query not match');
            }
        },
    });
};

export const Default: React.FC<{ version: Version | 'never' }> = ({ version }) => {
    const urqlClient = React.useMemo(() => createMockClient(version), [version]);
    return (
        <StorybookProvider urqlClient={urqlClient}>
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
