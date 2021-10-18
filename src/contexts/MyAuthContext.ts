import React from 'react';
import firebase from 'firebase/app';
import { Ref } from '../utils/ref';

export const loading = 'loading';
export const notSignIn = 'notSignIn';
export const authNotFound = 'authNotFound';
// UserではなくRef<User>としている理由は、useFirebaseUser内のonIdTokenChangedのコードを参照。
export type FirebaseUserState =
    | firebase.User
    | typeof loading
    | typeof notSignIn
    | typeof authNotFound;

export const getUserUid = (source: FirebaseUserState): string | undefined => {
    if (typeof source === 'string') {
        return undefined;
    }
    return source.uid;
};

export const MyAuthContext = React.createContext(loading as FirebaseUserState);
