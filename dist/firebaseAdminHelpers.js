"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdmin = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const config_1 = require("./config");
function getAdmin() {
    if (firebase_admin_1.default.apps.length > 0) {
        return firebase_admin_1.default.apps[0];
    }
    else {
        const app = firebase_admin_1.default.initializeApp({
            projectId: config_1.firebaseConfig.projectId,
        });
        return app;
    }
}
exports.getAdmin = getAdmin;
