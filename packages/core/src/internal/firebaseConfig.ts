import { z } from 'zod';
import { env } from './env';

export const firebaseConfig = z.object({
    // databaseURLというキーはおそらくFirestoreを有効化しないと含まれないため、除外している。

    [env.firebaseConfig.apiKey]: z.string(),
    [env.firebaseConfig.authDomain]: z.string(),
    [env.firebaseConfig.projectId]: z.string(),
    [env.firebaseConfig.storageBucket]: z.string(),
    [env.firebaseConfig.messagingSenderId]: z.string(),
    [env.firebaseConfig.appId]: z.string(),
});

export type FirebaseConfig = z.TypeOf<typeof firebaseConfig>;
