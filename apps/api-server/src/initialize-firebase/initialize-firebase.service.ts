import { Result } from '@kizahasi/result';
import { Injectable } from '@nestjs/common';
import admin from 'firebase-admin';
import { FIREBASE_PROJECT_ID } from '../env';
import { ServerConfigService } from '../server-config/server-config.service';

@Injectable()
export class InitializeFirebaseService {
    #hasInitialized: boolean = false;

    public constructor(private readonly serverConfigService: ServerConfigService) {}

    public async initialize(): Promise<Result<void>> {
        if (this.#hasInitialized) {
            return Result.ok(undefined);
        }
        const serverConfig = this.serverConfigService.getValueForce();
        const projectId =
            serverConfig.firebaseAdminSecret?.project_id ?? serverConfig.firebaseProjectId;
        if (serverConfig.firebaseAdminSecret == null) {
            if (projectId == null) {
                return Result.error(
                    `FirebaseのプロジェクトIDを取得できませんでした。${FIREBASE_PROJECT_ID} にプロジェクトIDをセットしてください。`,
                );
            }
            admin.initializeApp({ projectId });
        } else {
            admin.initializeApp({
                projectId,
                credential: admin.credential.cert({
                    projectId,
                    clientEmail: serverConfig.firebaseAdminSecret.client_email,
                    privateKey: serverConfig.firebaseAdminSecret.private_key,
                }),
            });
        }
        this.#hasInitialized = true;
        return Result.ok(undefined);
    }
}
