import React from 'react';
import { User } from 'firebase/auth';

export const loading = 'loading';
export const notSignIn = 'notSignIn';
export const authNotFound = 'authNotFound';
export type FirebaseUserState = User | typeof loading | typeof notSignIn | typeof authNotFound;

export const getUserUid = (source: FirebaseUserState): string | undefined => {
    if (typeof source === 'string') {
        return undefined;
    }
    return source.uid;
};

export const MyAuthContext = React.createContext(loading as FirebaseUserState);
