/* eslint-disable @typescript-eslint/no-namespace */
import { $free, $system } from './constants';
import { StrIndex10, strIndex10Array } from './indexes';

export namespace PublicChannelKey {
    export namespace Without$System {
        export type PublicChannelKey = typeof $free | StrIndex10;

        export const publicChannelKeys: ReadonlyArray<PublicChannelKey> = [
            ...strIndex10Array,
            $free,
        ];

        export const isPublicChannelKey = (source: unknown): source is PublicChannelKey => {
            return publicChannelKeys.find(key => key === source) !== undefined;
        };
    }

    export namespace With$System {
        export type PublicChannelKey = typeof $free | typeof $system | StrIndex10;

        export const publicChannelKeys: ReadonlyArray<PublicChannelKey> = [
            ...strIndex10Array,
            $free,
            $system,
        ];

        export const isPublicChannelKey = (source: unknown): source is PublicChannelKey => {
            return publicChannelKeys.find(key => key === source) !== undefined;
        };
    }
}
