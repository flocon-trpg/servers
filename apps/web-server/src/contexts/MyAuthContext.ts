import React from 'react';
import { User } from 'firebase/auth';

// CONSIDER: Contextをやめてjotaiに移行するべきか？

export const loading = 'loading';
export const notSignIn = 'notSignIn';
export const authNotFound = 'authNotFound';
// UserではなくRef<User>としている理由は、useFirebaseUser内のonIdTokenChangedのコードを参照。
export type FirebaseUserState = User | typeof loading | typeof notSignIn | typeof authNotFound;

export const getUserUid = (source: FirebaseUserState): string | undefined => {
    if (typeof source === 'string') {
        return undefined;
    }
    return source.uid;
};

export const MyAuthContext = React.createContext(loading as FirebaseUserState);
