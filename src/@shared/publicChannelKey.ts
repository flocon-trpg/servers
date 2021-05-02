/* eslint-disable @typescript-eslint/no-namespace */
import { $free, $system } from './Constants';

type StrIndex10Type =
    | '1'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '7'
    | '8'
    | '9'
    | '10'

const strIndex10Array = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
] as const;

export namespace PublicChannelKey {
    export namespace StrIndex10 {
        export type PublicChannelKey = StrIndex10Type

        export const publicChannelKeys: ReadonlyArray<PublicChannelKey> = [
            ...strIndex10Array,
        ];

        export const isPublicChannelKey = (source: unknown): source is PublicChannelKey => {
            return publicChannelKeys.find(key => key === source) !== undefined;
        };
    }

    export namespace Without$System {
        export type PublicChannelKey =
            | typeof $free
            | StrIndex10Type

        export const publicChannelKeys: ReadonlyArray<PublicChannelKey> = [
            ...strIndex10Array,
            $free,
        ];

        export const isPublicChannelKey = (source: unknown): source is PublicChannelKey => {
            return publicChannelKeys.find(key => key === source) !== undefined;
        };
    }

    export namespace With$System {
        export type PublicChannelKey =
            | typeof $free
            | typeof $system
            | StrIndex10Type

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
