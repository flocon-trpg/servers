import { User } from 'firebase/auth';

export const loading = 'loading';
export const notSignIn = 'notSignIn';
export const authNotFound = 'authNotFound';
export type FirebaseUserState = User | typeof loading | typeof notSignIn | typeof authNotFound;
