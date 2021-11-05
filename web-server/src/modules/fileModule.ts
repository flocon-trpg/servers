import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { FileType } from '../utils/fileType';

export namespace FirebaseStorageFile {
    export type Reference = firebase.default.storage.Reference;

    export type State = {
        reference: Reference;
        fullPath: string;
        fileName: string;
        fileType: FileType;
        metadata: unknown;
    };
}

export type State = {
    firebaseStorageUnlistedFiles?: ReadonlyArray<FirebaseStorageFile.State>;
    reloadFirebaseStorageUnlistedFilesKey: number;
    firebaseStoragePublicFiles?: ReadonlyArray<FirebaseStorageFile.State>;
    reloadFirebaseStoragePublicFilesKey: number;
};

type SetAction = Partial<
    Omit<State, 'reloadFirebaseStorageUnlistedFilesKey' | 'reloadFirebaseStoragePublicFilesKey'>
>;

const initState: State = {
    reloadFirebaseStoragePublicFilesKey: 0,
    reloadFirebaseStorageUnlistedFilesKey: 0,
};

export const fileModule = createSlice({
    name: 'file',
    initialState: initState,
    reducers: {
        set: (state: State, action: PayloadAction<SetAction>) => {
            return {
                ...state,
                firebaseStoragePublicFiles:
                    action.payload.firebaseStoragePublicFiles ?? state.firebaseStoragePublicFiles,
                firebaseStorageUnlistedFiles:
                    action.payload.firebaseStorageUnlistedFiles ??
                    state.firebaseStorageUnlistedFiles,
            };
        },
        reloadFirebaseStoragePublicFiles: (state: State, action: PayloadAction<void>) => {
            return {
                ...state,
                reloadFirebaseStoragePublicFilesKey: state.reloadFirebaseStoragePublicFilesKey + 1,
            };
        },
        reloadFirebaseStorageUnlistedFiles: (state: State, action: PayloadAction<void>) => {
            return {
                ...state,
                reloadFirebaseStorageUnlistedFilesKey:
                    state.reloadFirebaseStorageUnlistedFilesKey + 1,
            };
        },
        reset: (state: State, action: PayloadAction<void>) => {
            return initState;
        },
    },
});
