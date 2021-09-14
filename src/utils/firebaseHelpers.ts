import { Auth, getAuth as getAuthCore } from 'firebase/auth';
import { FirebaseApp, initializeApp, getApp as getAppCore, getApps } from 'firebase/app';
import { FirebaseStorage, getStorage as getStorageCore } from 'firebase/storage';
import { Config } from '../config';

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _storage: FirebaseStorage | null = null;

const getApp = (config: Config): FirebaseApp | null => {
    const isBrowser = typeof window !== 'undefined';
    if (!isBrowser) {
        // もしこれがないと、next exportなどを実行したときに_appに変なインスタンスが入るので、_app.storage()などを実行すると「storage is not a function」と言われコケてしまう。next devなどでは大丈夫。
        return null;
    }
    if (_app != null) return _app;
    if (getApps().length > 0) {
        _app = getAppCore();
        return _app;
    } else {
        _app = initializeApp(config.firebase);
        return _app;
    }
};

export const getAuth = (config: Config): Auth | null => {
    if (_auth != null) {
        return _auth;
    }
    const app = getApp(config);
    if (app == null) {
        return null;
    }
    _auth = getAuthCore();
    return _auth;
};

export const getAuthForce = (config: Config): Auth => {
    const auth = getAuth(config);
    if (auth == null) {
        throw new Error('auth == null');
    }
    return auth;
};

export const getStorage = (config: Config): FirebaseStorage | null => {
    if (_storage != null) {
        return _storage;
    }
    const app = getApp(config);
    if (app == null) {
        return null;
    }
    _storage = getStorageCore();
    return _storage;
};

export const getStorageForce = (config: Config): FirebaseStorage => {
    const storage = getStorage(config);
    if (storage == null) {
        throw new Error('storage == null');
    }
    return storage;
};
