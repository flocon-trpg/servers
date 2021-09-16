import React from 'react';
import firebase from 'firebase/app';
import { Ref } from '../utils/ref';

export const loading = 'loading';
export const notSignIn = 'notSignIn';
export const authNotFound = 'authNotFound';
// onIdTokenChangedが実行されるたびにgetIdTokenの結果は変わるが、おそらくUserの参照は変わらない。そのため、depsに直接Userを入れるとidTokenの更新処理がされなくなってしまう。そのため、代わりにRef<User>としている。getIdTokenを実行するhookのdepsには、UserではなくRef<User>を書くことを忘れずに。
export type FirebaseUserState =
    | Ref<firebase.User>
    | typeof loading
    | typeof notSignIn
    | typeof authNotFound;

export const getUserUid = (source: FirebaseUserState): string | undefined => {
    if (typeof source === 'string') {
        return undefined;
    }
    return source.value.uid;
};

export const MyAuthContext = React.createContext(loading as FirebaseUserState);
