import { Result } from '@kizahasi/result';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { EnvsMonitorContent } from './EnvsMonitor';
import { EnvsMonitorAtomReturnType } from '@/atoms/webConfigAtom/webConfigAtom';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';

export const AllEmpty: React.FC<{
    envsMonitor: EnvsMonitorAtomReturnType;
}> = ({ envsMonitor }) => {
    return (
        <StorybookProvider roomClientContextValue={null} compact>
            <EnvsMonitorContent envsMonitor={envsMonitor} />
        </StorybookProvider>
    );
};

const meta = {
    title: 'models/envs/EnvsMonitor',
    component: AllEmpty,
    args: {
        envsMonitor: {
            publicEnvTxtFetched: true,

            value: {
                authProviders: {
                    importMetaEnv: {
                        source: undefined,
                        parsed: undefined,
                    },
                    publicEnvTxt: {
                        source: undefined,
                        parsed: undefined,
                    },
                    final: undefined,
                },
                http: {
                    importMetaEnv: undefined,
                    publicEnvTxt: undefined,
                    final: undefined,
                },
                ws: {
                    importMetaEnv: undefined,
                    publicEnvTxt: undefined,
                    final: undefined,
                },
                logLevel: {
                    importMetaEnv: {
                        source: undefined,
                        parsed: undefined,
                    },
                    publicEnvTxt: {
                        source: undefined,
                        parsed: undefined,
                    },
                    final: undefined,
                },
                isUnlistedFirebaseStorageEnabled: {
                    importMetaEnv: {
                        source: undefined,
                        parsed: undefined,
                    },
                    publicEnvTxt: {
                        source: undefined,
                        parsed: undefined,
                    },
                    final: undefined,
                },
                firebaseConfig: {
                    importMetaEnv: {
                        source: undefined,
                        parsed: undefined,
                    },
                    publicEnvTxt: {
                        source: undefined,
                        parsed: undefined,
                    },
                    final: undefined,
                },
            },
        },
    },
} satisfies Meta<typeof AllEmpty>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ImportMetaEnvOnly: Story = {
    args: {
        envsMonitor: {
            publicEnvTxtFetched: true,

            value: {
                authProviders: {
                    importMetaEnv: {
                        source: 'anonymous,email,google',
                        parsed: ['anonymous', 'email', 'google'],
                    },
                    publicEnvTxt: {
                        source: undefined,
                        parsed: undefined,
                    },
                    final: ['anonymous', 'email', 'google'],
                },
                http: {
                    importMetaEnv: 'https://example.com',
                    publicEnvTxt: undefined,
                    final: 'https://example.com',
                },
                ws: {
                    importMetaEnv: undefined,
                    publicEnvTxt: 'wss://example.com',
                    final: 'wss://example.com',
                },
                logLevel: {
                    importMetaEnv: {
                        source: 'debug',
                        parsed: Result.ok('debug'),
                    },
                    publicEnvTxt: {
                        source: undefined,
                        parsed: undefined,
                    },
                    final: 'debug',
                },
                isUnlistedFirebaseStorageEnabled: {
                    importMetaEnv: {
                        source: 'true',
                        parsed: Result.ok(true),
                    },
                    publicEnvTxt: {
                        source: undefined,
                        parsed: undefined,
                    },
                    final: true,
                },
                firebaseConfig: {
                    importMetaEnv: {
                        source: '{"apiKey":"api-key","authDomain":"auth-domain","projectId":"project-id","storageBucket":"storage-bucket","messagingSenderId":"messaging-sender-id","appId":"app-id"}',
                        parsed: Result.ok({
                            apiKey: 'api-key',
                            authDomain: 'auth-domain',
                            projectId: 'project-id',
                            storageBucket: 'storage-bucket',
                            messagingSenderId: 'messaging-sender-id',
                            appId: 'app-id',
                        }),
                    },
                    publicEnvTxt: {
                        source: undefined,
                        parsed: undefined,
                    },
                    final: {
                        apiKey: 'api-key',
                        authDomain: 'auth-domain',
                        projectId: 'project-id',
                        storageBucket: 'storage-bucket',
                        messagingSenderId: 'messaging-sender-id',
                        appId: 'app-id',
                    },
                },
            },
        },
    },
};

export const EnvTxtOnly: Story = {
    args: {
        envsMonitor: {
            publicEnvTxtFetched: true,

            value: {
                authProviders: {
                    importMetaEnv: {
                        source: undefined,
                        parsed: undefined,
                    },
                    publicEnvTxt: {
                        source: 'anonymous,email,google',
                        parsed: ['anonymous', 'email', 'google'],
                    },
                    final: ['anonymous', 'email', 'google'],
                },
                http: {
                    importMetaEnv: undefined,
                    publicEnvTxt: 'https://example.com',
                    final: 'https://example.com',
                },
                ws: {
                    importMetaEnv: 'wss://example.com',
                    publicEnvTxt: undefined,
                    final: 'wss://example.com',
                },
                logLevel: {
                    importMetaEnv: {
                        source: undefined,
                        parsed: undefined,
                    },
                    publicEnvTxt: {
                        source: 'debug',
                        parsed: Result.ok('debug'),
                    },
                    final: 'debug',
                },
                isUnlistedFirebaseStorageEnabled: {
                    importMetaEnv: {
                        source: undefined,
                        parsed: undefined,
                    },
                    publicEnvTxt: {
                        source: 'true',
                        parsed: Result.ok(true),
                    },
                    final: true,
                },
                firebaseConfig: {
                    importMetaEnv: {
                        source: undefined,
                        parsed: undefined,
                    },
                    publicEnvTxt: {
                        source: '{"apiKey":"api-key","authDomain":"auth-domain","projectId":"project-id","storageBucket":"storage-bucket","messagingSenderId":"messaging-sender-id","appId":"app-id"}',
                        parsed: Result.ok({
                            apiKey: 'api-key',
                            authDomain: 'auth-domain',
                            projectId: 'project-id',
                            storageBucket: 'storage-bucket',
                            messagingSenderId: 'messaging-sender-id',
                            appId: 'app-id',
                        }),
                    },
                    final: {
                        apiKey: 'api-key',
                        authDomain: 'auth-domain',
                        projectId: 'project-id',
                        storageBucket: 'storage-bucket',
                        messagingSenderId: 'messaging-sender-id',
                        appId: 'app-id',
                    },
                },
            },
        },
    },
};

export const ParseErrors: Story = {
    args: {
        envsMonitor: {
            publicEnvTxtFetched: true,

            value: {
                authProviders: {
                    importMetaEnv: {
                        source: undefined,
                        parsed: undefined,
                    },
                    publicEnvTxt: {
                        source: undefined,
                        parsed: undefined,
                    },
                    final: undefined,
                },
                http: {
                    importMetaEnv: undefined,
                    publicEnvTxt: undefined,
                    final: undefined,
                },
                ws: {
                    importMetaEnv: undefined,
                    publicEnvTxt: undefined,
                    final: undefined,
                },
                logLevel: {
                    importMetaEnv: {
                        source: 'INVALID',
                        parsed: Result.error('Storybook fake error'),
                    },
                    publicEnvTxt: {
                        source: 'INVALID',
                        parsed: Result.error('Storybook fake error'),
                    },
                    final: undefined,
                },
                isUnlistedFirebaseStorageEnabled: {
                    importMetaEnv: {
                        source: 'INVALID',
                        parsed: Result.error('Storybook fake error'),
                    },
                    publicEnvTxt: {
                        source: 'INVALID',
                        parsed: Result.error('Storybook fake error'),
                    },
                    final: true,
                },
                firebaseConfig: {
                    importMetaEnv: {
                        source: 'INVALID',
                        parsed: Result.error('Storybook fake error'),
                    },
                    publicEnvTxt: {
                        source: 'INVALID',
                        parsed: Result.error(
                            'Storybook fake error very long message: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
                        ),
                    },
                    final: undefined,
                },
            },
        },
    },
};

export const EnvTxtNotFetched: Story = {
    args: {
        envsMonitor: {
            publicEnvTxtFetched: false,

            value: {
                authProviders: {
                    importMetaEnv: {
                        source: 'anonymous,email,google',
                        parsed: ['anonymous', 'email', 'google'],
                    },
                    publicEnvTxt: undefined,
                    final: ['anonymous', 'email', 'google'],
                },
                http: {
                    importMetaEnv: 'https://example.com',
                    publicEnvTxt: undefined,
                    final: 'https://example.com',
                },
                ws: {
                    importMetaEnv: undefined,
                    publicEnvTxt: undefined,
                    final: 'wss://example.com',
                },
                logLevel: {
                    importMetaEnv: {
                        source: 'debug',
                        parsed: Result.ok('debug'),
                    },
                    publicEnvTxt: undefined,
                    final: 'debug',
                },
                isUnlistedFirebaseStorageEnabled: {
                    importMetaEnv: {
                        source: 'true',
                        parsed: Result.ok(true),
                    },
                    publicEnvTxt: undefined,
                    final: true,
                },
                firebaseConfig: {
                    importMetaEnv: {
                        source: '{"apiKey":"api-key","authDomain":"auth-domain","projectId":"project-id","storageBucket":"storage-bucket","messagingSenderId":"messaging-sender-id","appId":"app-id"}',
                        parsed: Result.ok({
                            apiKey: 'api-key',
                            authDomain: 'auth-domain',
                            projectId: 'project-id',
                            storageBucket: 'storage-bucket',
                            messagingSenderId: 'messaging-sender-id',
                            appId: 'app-id',
                        }),
                    },
                    publicEnvTxt: undefined,
                    final: {
                        apiKey: 'api-key',
                        authDomain: 'auth-domain',
                        projectId: 'project-id',
                        storageBucket: 'storage-bucket',
                        messagingSenderId: 'messaging-sender-id',
                        appId: 'app-id',
                    },
                },
            },
        },
    },
};
