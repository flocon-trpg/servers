import { firebaseConfig } from '../firebaseConfig';

const createFakeFirebaseConfig1 = () => {
    const json =
        '{"apiKey": "1abcde-ghijk-lmno-1234","authDomain": "1***.firebaseapp.com","projectId": "1***","storageBucket": "1***.appspot.com","messagingSenderId": "11234567890","appId": "1:1234567890:web:1234567890abcdef"}';
    const parsed = firebaseConfig.parse(JSON.parse(json));
    return [parsed, json as string] as const;
};

export const fakeFirebaseConfig1 = createFakeFirebaseConfig1();

const createFakeFirebaseConfig2 = () => {
    const json =
        '{"apiKey": "2abcde-ghijk-lmno-1234","authDomain": "2***.firebaseapp.com","projectId": "2***","storageBucket": "2***.appspot.com","messagingSenderId": "21234567890","appId": "2:1234567890:web:1234567890abcdef"}';
    const parsed = firebaseConfig.parse(JSON.parse(json));
    return [parsed, json as string] as const;
};

export const fakeFirebaseConfig2 = createFakeFirebaseConfig2();
