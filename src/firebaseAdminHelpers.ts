import admin from 'firebase-admin';
import { loadFirebaseConfig } from './config';

export function getAdmin(): admin.app.App {
    if (admin.apps.length > 0) {
        return admin.apps[0] as admin.app.App;
    } else {
        const app = admin.initializeApp({
            projectId: loadFirebaseConfig().projectId,
        });
        return app;
    }
}
