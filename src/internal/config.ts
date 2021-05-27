import { JsonObject } from './jsonObject';

export type FirebaseConfig = {
    apiKey: string;
    authDomain: string;
    databaseURL: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
};

export const createFirebaseConfig = (json: any): FirebaseConfig => {
    const j = JsonObject.init(json);

    return {
        apiKey: j.get('apiKey').valueAsString(),
        authDomain: j.get('authDomain').valueAsString(),
        databaseURL: j.get('databaseURL').valueAsString(),
        projectId: j.get('projectId').valueAsString(),
        storageBucket: j.get('storageBucket').valueAsString(),
        messagingSenderId: j.get('messagingSenderId').valueAsString(),
        appId: j.get('appId').valueAsString(),
        measurementId: j.get('measurementId').valueAsString(),
    };
};
