import React from 'react';
import { ComponentMeta } from '@storybook/react';
import { SignIn } from './SignIn';
import { useSetAtom } from 'jotai';
import { storybookAtom } from '@/atoms/storybookAtom/storybookAtom';
import { Result } from '@kizahasi/result';
import * as Env from '@/env';
import { mockAuth, mockUser, mockWebConfig } from '@/mocks';

export const Default: React.FC<{
    amIAnonymous: boolean;
    isAuthProvidersUndefined: boolean;
    [Env.anonymous]: boolean;
    [Env.email]: boolean;
    [Env.facebook]: boolean;
    [Env.github]: boolean;
    [Env.google]: boolean;
    [Env.phone]: boolean;
    [Env.twitter]: boolean;
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
            authProviders.push(Env.anonymous);
        }
        if (email) {
            authProviders.push(Env.email);
        }
        if (facebook) {
            authProviders.push(Env.facebook);
        }
        if (github) {
            authProviders.push(Env.github);
        }
        if (google) {
            authProviders.push(Env.google);
        }
        if (phone) {
            authProviders.push(Env.phone);
        }
        if (twitter) {
            authProviders.push(Env.twitter);
        }
    }
    React.useEffect(() => {
        setStorybook({
            isStorybook: true,
            mock: {
                auth: { ...mockAuth, currentUser: { ...mockUser, isAnonymous: amIAnonymous } },
                webConfig: Result.ok(mockWebConfig),
            },
        });
    }, [amIAnonymous, authProviders, setStorybook]);
    return <SignIn />;
};

export default {
    title: 'models/auth/SignIn',
    component: Default,
    args: {
        amIAnonymous: false,
        isAuthProvidersUndefined: true,
        [Env.anonymous]: false,
        [Env.email]: false,
        [Env.facebook]: false,
        [Env.github]: false,
        [Env.google]: false,
        [Env.phone]: false,
        [Env.twitter]: false,
    },
} as ComponentMeta<typeof Default>;
