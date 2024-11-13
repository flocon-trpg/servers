import { env, fakeFirebaseConfig2 } from '@flocon-trpg/core';

export const fakeEnvTextSource = {
    [env.NEXT_PUBLIC_API_HTTP]: 'https://envtxt.example.com',
    [env.NEXT_PUBLIC_API_WS]: 'wss://envtxt.example.com',
    [env.NEXT_PUBLIC_AUTH_PROVIDERS]: [env.authProviders.email, env.authProviders.facebook],
    [env.NEXT_PUBLIC_FIREBASE_CONFIG]: fakeFirebaseConfig2[0],
    [env.NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED]: false,
} as const;

export const fakeEnvText = `
${env.NEXT_PUBLIC_API_HTTP}=${fakeEnvTextSource[env.NEXT_PUBLIC_API_HTTP]}
${env.NEXT_PUBLIC_API_WS}=${fakeEnvTextSource[env.NEXT_PUBLIC_API_WS]}
${env.NEXT_PUBLIC_AUTH_PROVIDERS}=${env.authProviders.email},${env.authProviders.facebook}
${env.NEXT_PUBLIC_FIREBASE_CONFIG}=${fakeFirebaseConfig2[1]}
${env.NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED}=${fakeEnvTextSource[
    env.NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED
].toString()}
`;
