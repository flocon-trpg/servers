import React from 'react';
import firebase from 'firebase/app';
import useConstant from 'use-constant';
import { getAuth } from '../utils/firebaseHelpers';
import ConfigContext from '../contexts/ConfigContext';

let userCache: firebase.User | null = null;

// _app.tsxで1回のみ呼ばれることを想定。firebase authのデータを取得したい場合はContextで行う。
export const useFirebaseUser = (): firebase.User | null => {
    const config = React.useContext(ConfigContext);
    const auth = getAuth(config);
    const [user, setUser] = React.useState<firebase.User | null>(userCache);
    React.useEffect(() => {
        if (auth == null) {
            return;
        }
        const unsubscribe = auth.onIdTokenChanged(user => {
            userCache = user;
            setUser(user);
        });
        return () => unsubscribe();
    }, [auth]);
    return user;
};