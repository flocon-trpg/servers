import 'firebase/auth';
import firebase from 'firebase/app';
import { WebConfig } from '../configType';

let _app: firebase.app.App | null = null;
let _auth: firebase.auth.Auth | null = null;
let _storage: firebase.storage.Storage | null = null;

const getApp = (config: WebConfig): firebase.app.App | null => {
    const isBrowser = typeof window !== 'undefined';
    if (!isBrowser) {
        // もしこれがないと、next exportなどを実行したときに_appに変なインスタンスが入るので、_app.storage()などを実行すると「storage is not a function」と言われコケてしまう。next devなどでは大丈夫。
        return null;
    }
    if (_app != null) return _app;
    if (firebase.apps.length > 0) {
        _app = firebase.app();
        return _app;
    } else {
        _app = firebase.initializeApp(config.firebaseConfig);
        return _app;
    }
};

export const getAuth = (config: WebConfig): firebase.auth.Auth | null => {
    if (_auth != null) {
        return _auth;
    }
    const app = getApp(config);
    if (app == null) {
        return null;
    }
    _auth = app.auth();
    return _auth;
};

export const getAuthForce = (config: WebConfig): firebase.auth.Auth => {
    const auth = getAuth(config);
    if (auth == null) {
        throw new Error('auth == null');
    }
    return auth;
};

export const getStorage = (config: WebConfig): firebase.storage.Storage | null => {
    if (_storage != null) {
        return _storage;
    }
    const app = getApp(config);
    if (app == null) {
        return null;
    }
    _storage = app.storage();
    return _storage;
};

export const getStorageForce = (config: WebConfig): firebase.storage.Storage => {
    const storage = getStorage(config);
    if (storage == null) {
        throw new Error('storage == null');
    }
    return storage;
};