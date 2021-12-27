import { getAuth as getAuthCore, Auth } from 'firebase/auth';
import { getStorage as getStorageCore, FirebaseStorage } from 'firebase/storage';
import { getApps, initializeApp, FirebaseApp } from 'firebase/app';
import { WebConfig } from '../configType';

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _storage: FirebaseStorage | null = null;

const getApp = (config: WebConfig): FirebaseApp | null => {
    const isBrowser = typeof window !== 'undefined';
    if (!isBrowser) {
        // もしこれがないと、next exportなどを実行したときに_appに変なインスタンスが入るので、_app.storage()などを実行すると「storage is not a function」と言われコケてしまう。next devなどでは大丈夫。
        return null;
    }
    if (_app != null) return _app;
    const [app] = getApps();
    if (app != null) {
        _app = app;
        return _app;
    } else {
        _app = initializeApp(config.firebaseConfig);
        return _app;
    }
};

export const getAuth = (config: WebConfig): Auth | null => {
    if (_auth != null) {
        return _auth;
    }
    const app = getApp(config);
    if (app == null) {
        return null;
    }
    _auth = getAuthCore(app);
    return _auth;
};

export const getAuthForce = (config: WebConfig): Auth => {
    const auth = getAuth(config);
    if (auth == null) {
        throw new Error('auth == null');
    }
    return auth;
};

export const getStorage = (config: WebConfig): FirebaseStorage | null => {
    if (_storage != null) {
        return _storage;
    }
    const app = getApp(config);
    if (app == null) {
        return null;
    }
    _storage = getStorageCore(app);
    return _storage;
};

export const getStorageForce = (config: WebConfig): FirebaseStorage => {
    const storage = getStorage(config);
    if (storage == null) {
        throw new Error('storage == null');
    }
    return storage;
};
