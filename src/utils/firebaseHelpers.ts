import 'firebase/auth';
import firebase from 'firebase/app';
import { Config } from '../config';

let _app: firebase.app.App | null = null;
let _auth: firebase.auth.Auth | null = null;
let _storage: firebase.storage.Storage | null = null;

const getApp = (config: Config): firebase.app.App | null => {
    const isBrowser =  typeof window !== 'undefined';
    if (!isBrowser) {
        // もしこれがないと、next exportなどを実行したときに_appに変なインスタンスが入るので、_app.storage()などを実行すると「storage is not a function」と言われコケてしまう。next devなどでは大丈夫。
        return null;
    }
    if (_app != null) return _app;
    if (firebase.apps.length > 0) {
        _app = firebase.app();
        return _app;
    } else {
        _app = firebase.initializeApp(config.firebase);
        return _app;
    }
};

export const getAuth = (config: Config): firebase.auth.Auth | null => {
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

export const getAuthForce = (config: Config): firebase.auth.Auth => {
    const auth = getAuth(config);
    if (auth == null) {
        throw 'auth == null';
    }
    return auth;
};

export const getStorage = (config: Config): firebase.storage.Storage | null => {
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

export const getStorageForce = (config: Config): firebase.storage.Storage => {
    const storage = getStorage(config);
    if (storage == null) {
        throw 'storage == null';
    }
    return storage;
};