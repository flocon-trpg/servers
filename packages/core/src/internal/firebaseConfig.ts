import { z } from 'zod';

export const firebaseConfig = z.object({
    // databaseURLというキーはおそらくFirestoreを有効化しないと含まれないため、除外している。

    apiKey: z.string(),
    authDomain: z.string(),
    projectId: z.string(),
    storageBucket: z.string(),
    messagingSenderId: z.string(),
    appId: z.string(),
});

export type FirebaseConfig = z.TypeOf<typeof firebaseConfig>;
