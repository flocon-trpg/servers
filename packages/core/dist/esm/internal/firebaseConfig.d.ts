import { z } from 'zod';
export declare const firebaseConfig: z.ZodObject<{
    apiKey: z.ZodString;
    authDomain: z.ZodString;
    projectId: z.ZodString;
    storageBucket: z.ZodString;
    messagingSenderId: z.ZodString;
    appId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
}, {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
}>;
export type FirebaseConfig = z.TypeOf<typeof firebaseConfig>;
//# sourceMappingURL=firebaseConfig.d.ts.map