import { $free, $system } from './constants';
import { StrIndex10 } from './indexes';
export declare namespace PublicChannelKey {
    namespace Without$System {
        type PublicChannelKey = typeof $free | StrIndex10;
        const publicChannelKeys: ReadonlyArray<PublicChannelKey>;
        const isPublicChannelKey: (source: unknown) => source is PublicChannelKey;
    }
    namespace With$System {
        type PublicChannelKey = typeof $free | typeof $system | StrIndex10;
        const publicChannelKeys: ReadonlyArray<PublicChannelKey>;
        const isPublicChannelKey: (source: unknown) => source is PublicChannelKey;
    }
}
//# sourceMappingURL=publicChannelKey.d.ts.map