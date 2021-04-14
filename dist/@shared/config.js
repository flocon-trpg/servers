"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFirebaseConfig = void 0;
const JSONObject_1 = require("./JSONObject");
const createFirebaseConfig = (json) => {
    const j = JSONObject_1.JSONObject.init(json);
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
exports.createFirebaseConfig = createFirebaseConfig;
