import { FirebaseConfig } from '@flocon-trpg/core';
import { PinoLogLevel } from '@flocon-trpg/utils';

export type WebConfig = {
    firebaseConfig: FirebaseConfig;
    http?: string;
    ws?: string;
    authProviders?: string[];
    isUnlistedFirebaseStorageEnabled: boolean;
    logLevel?: PinoLogLevel;

    // 現状、常にfalseがセットされる
    isPublicFirebaseStorageEnabled: boolean;
};
