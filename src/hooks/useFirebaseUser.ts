import React from 'react';
import firebase from 'firebase/app';
import { getAuth } from '../utils/firebaseHelpers';
import ConfigContext from '../contexts/ConfigContext';

export const loading = 'loading';
export const notSignIn = 'notSignIn';
export const authNotFound = 'authNotFound';
export type FirebaseUserState =
    | firebase.User
    | typeof loading
    | typeof notSignIn
    | typeof authNotFound;

// _app.tsxで1回のみ呼ばれることを想定。firebase authのデータを取得したい場合はContextで行う。
export const useFirebaseUser = (): FirebaseUserState => {
    const config = React.useContext(ConfigContext);
    const auth = getAuth(config);
    const [user, setUser] = React.useState<FirebaseUserState>(loading);
    React.useEffect(() => {
        if (auth == null) {
            setUser(authNotFound);
            return;
        }
        const unsubscribe = auth.onIdTokenChanged(user => {
            setUser(user == null ? notSignIn : user);
        });
        return () => {
            unsubscribe();
            setUser(loading);
        };
    }, [auth]);
    return user;
};

export const getUserUid = (source: FirebaseUserState): string | undefined => {
    if (typeof source === 'string') {
        return undefined;
    }
    return source.uid;
};
