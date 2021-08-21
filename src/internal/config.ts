import * as t from 'io-ts';

export const firebaseConfig = {
    apiKey: t.string,
    authDomain: t.string,
    databaseURL: t.string,
    projectId: t.string,
    storageBucket: t.string,
    messagingSenderId: t.string,
    appId: t.string,
    measurementId: t.string,
};

export type FirebaseConfig = t.Type<typeof firebaseConfig>;
