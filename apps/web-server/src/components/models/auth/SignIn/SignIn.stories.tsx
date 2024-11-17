import { env } from '@flocon-trpg/core';
import { Result } from '@kizahasi/result';
import { Meta } from '@storybook/react';
import { useSetAtom } from 'jotai';
import React from 'react';
import { SignIn } from './SignIn';
import { storybookAtom } from '@/atoms/storybookAtom/storybookAtom';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
import { mockAuth, mockUser, mockWebConfig } from '@/mocks';
import { createMockUrqlClientForLayout } from '@/mocks/createMockUrqlClientForLayout';

export const Default: React.FC<{
    amIAnonymous: boolean;
    isAuthProvidersUndefined: boolean;
    [env.authProviders.anonymous]: boolean;
    [env.authProviders.email]: boolean;
    [env.authProviders.facebook]: boolean;
    [env.authProviders.github]: boolean;
    [env.authProviders.google]: boolean;
    [env.authProviders.phone]: boolean;
    [env.authProviders.twitter]: boolean;
}> = ({
    amIAnonymous,
    isAuthProvidersUndefined,
    anonymous,
    email,
    facebook,
    github,
    google,
    phone,
    twitter,
}) => {
    const setStorybook = useSetAtom(storybookAtom);
    let authProviders: string[] | undefined = undefined;
    if (!isAuthProvidersUndefined) {
        authProviders = [];

        if (anonymous) {
            authProviders.push(env.authProviders.anonymous);
        }
        if (email) {
            authProviders.push(env.authProviders.email);
        }
        if (facebook) {
            authProviders.push(env.authProviders.facebook);
        }
        if (github) {
            authProviders.push(env.authProviders.github);
        }
        if (google) {
            authProviders.push(env.authProviders.google);
        }
        if (phone) {
            authProviders.push(env.authProviders.phone);
        }
        if (twitter) {
            authProviders.push(env.authProviders.twitter);
        }
    }
    React.useEffect(() => {
        setStorybook({
            isStorybook: true,
            mock: {
                auth: {
                    ...mockAuth,
                    currentUser: { ...mockUser, isAnonymous: amIAnonymous },
                    onAuthStateChanged: observer => {
                        const unsubscribe = () => undefined;
                        if (typeof observer === 'function') {
                            observer(mockUser);
                            return unsubscribe;
                        }
                        observer.next(mockUser);
                        return unsubscribe;
                    },
                },
                webConfig: mockWebConfig,
            },
        });
    }, [amIAnonymous, authProviders, setStorybook]);
    const mockUrqlClient = React.useRef(createMockUrqlClientForLayout());
    return (
        <StorybookProvider
            compact={false}
            roomClientContextValue={null}
            urqlClient={mockUrqlClient.current}
        >
            <SignIn />
        </StorybookProvider>
    );
};

const meta = {
    title: 'models/auth/SignIn',
    component: Default,
    args: {
        amIAnonymous: false,
        isAuthProvidersUndefined: true,
        [env.authProviders.anonymous]: false,
        [env.authProviders.email]: false,
        [env.authProviders.facebook]: false,
        [env.authProviders.github]: false,
        [env.authProviders.google]: false,
        [env.authProviders.phone]: false,
        [env.authProviders.twitter]: false,
    },
} satisfies Meta<typeof Default>;

export default meta;
