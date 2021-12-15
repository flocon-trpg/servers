import { FirebaseConfig } from '@flocon-trpg/core';

export type WebConfig = {
    firebaseConfig: FirebaseConfig;
    http?: string;
    ws?: string;
    authProviders: string[];
    isUnlistedFirebaseStorageEnabled: boolean;

    // 現状、常にfalseがセットされる
    isPublicFirebaseStorageEnabled: boolean;
};
