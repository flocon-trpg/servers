import { FirebaseConfig } from '@flocon-trpg/core';
import { PinoLogLevel } from '@flocon-trpg/utils';

export type WebConfigMock = {
    http?: string;
    ws?: string;
    authProviders?: string[];
    isUnlistedFirebaseStorageEnabled: boolean;
    logLevel?: PinoLogLevel;

    // 現状、常にfalseがセットされる
    isPublicFirebaseStorageEnabled: boolean;
};

export type WebConfig = WebConfigMock & {
    firebaseConfig: FirebaseConfig;
};
