import { UploaderPathSource, joinPath } from '@flocon-trpg/core';

export const $public = 'public';
export const unlisted = 'unlisted';
export type StorageType = typeof $public | typeof unlisted;
export const Path = {
    public: {
        file: (filePath: UploaderPathSource) =>
            joinPath('version', '1', 'uploader', 'public', filePath),
        list: joinPath('version', '1', 'uploader', 'public'),
    },
    unlisted: {
        file: (userId: string, filePath: UploaderPathSource) =>
            joinPath('version', '1', 'uploader', 'unlisted', userId, filePath),
        list: (userId: string) => joinPath('version', '1', 'uploader', 'unlisted', userId),
    },
};
