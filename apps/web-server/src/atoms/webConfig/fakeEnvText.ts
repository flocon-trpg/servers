import { fakeFirebaseConfig2 } from '@flocon-trpg/core';
import {
    email,
    facebook,
    NEXT_PUBLIC_API_HTTP,
    NEXT_PUBLIC_API_WS,
    NEXT_PUBLIC_AUTH_PROVIDERS,
    NEXT_PUBLIC_FIREBASE_CONFIG,
    NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED,
} from '../../env';

export const fakeEnvTextSource = {
    [NEXT_PUBLIC_API_HTTP]: 'https://envtxt.example.com',
    [NEXT_PUBLIC_API_WS]: 'wss://envtxt.example.com',
    [NEXT_PUBLIC_AUTH_PROVIDERS]: [email, facebook],
    [NEXT_PUBLIC_FIREBASE_CONFIG]: fakeFirebaseConfig2[0],
    [NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED]: false,
} as const;

export const fakeEnvText = `
${NEXT_PUBLIC_API_HTTP}=${fakeEnvTextSource[NEXT_PUBLIC_API_HTTP]}
${NEXT_PUBLIC_API_WS}=${fakeEnvTextSource[NEXT_PUBLIC_API_WS]}
${NEXT_PUBLIC_AUTH_PROVIDERS}=${email},${facebook}
${NEXT_PUBLIC_FIREBASE_CONFIG}=${fakeFirebaseConfig2[1]}
${NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED}=${fakeEnvTextSource[NEXT_PUBLIC_API_WS]}
`;
