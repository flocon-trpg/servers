import * as t from 'io-ts';

export const firebaseConfig = t.type({
    // databaseURLというキーはおそらくFirestoreを有効化しないと含まれないため、除外している。

    apiKey: t.string,
    authDomain: t.string,
    projectId: t.string,
    storageBucket: t.string,
    messagingSenderId: t.string,
    appId: t.string,
});

export type FirebaseConfig = t.TypeOf<typeof firebaseConfig>;
