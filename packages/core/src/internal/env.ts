export const env = {
    // @flocon-trpg/web-server にはこれらを import せずに環境変数のキーを文字列として直接入力している箇所があるため、そちらも合わせる必要があることに注意。
    NEXT_PUBLIC_FIREBASE_CONFIG: 'NEXT_PUBLIC_FIREBASE_CONFIG',
    NEXT_PUBLIC_API_HTTP: 'NEXT_PUBLIC_API_HTTP',
    NEXT_PUBLIC_API_WS: 'NEXT_PUBLIC_API_WS',
    NEXT_PUBLIC_AUTH_PROVIDERS: 'NEXT_PUBLIC_AUTH_PROVIDERS',
    NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED: 'NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED',
    NEXT_PUBLIC_LOG_LEVEL: 'NEXT_PUBLIC_LOG_LEVEL',

    firebaseConfig: {
        apiKey: 'apiKey',
        authDomain: 'authDomain',
        projectId: 'projectId',
        storageBucket: 'storageBucket',
        messagingSenderId: 'messagingSenderId',
        appId: 'appId',
    },

    authProviders: {
        // TODO: これら以外にも対応させる
        anonymous: 'anonymous',
        email: 'email',
        google: 'google',
        facebook: 'facebook',
        github: 'github',
        twitter: 'twitter',
        phone: 'phone',
    },
} as const;
