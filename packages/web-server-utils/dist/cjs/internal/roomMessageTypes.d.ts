import { PieceLogFragmentDoc, RoomPrivateMessageFragmentDoc, RoomPublicChannelFragmentDoc, RoomPublicMessageFragmentDoc, RoomSoundEffectFragmentDoc } from '@flocon-trpg/graphql-documents';
import { ResultOf } from '@graphql-typed-document-node/core';
type PieceLogFragment = ResultOf<typeof PieceLogFragmentDoc>;
type RoomPublicMessageFragment = ResultOf<typeof RoomPublicMessageFragmentDoc>;
type RoomPrivateMessageFragment = ResultOf<typeof RoomPrivateMessageFragmentDoc>;
type RoomPublicChannelFragment = ResultOf<typeof RoomPublicChannelFragmentDoc>;
type RoomSoundEffectFragment = ResultOf<typeof RoomSoundEffectFragmentDoc>;
export declare const privateMessage = "privateMessage";
export declare const publicMessage = "publicMessage";
export declare const pieceLog = "pieceLog";
export declare const publicChannel = "publicChannel";
export declare const soundEffect = "soundEffect";
type PrivateMessageType = {
    type: typeof privateMessage;
    value: RoomPrivateMessageFragment;
};
type PublicMessageType = {
    type: typeof publicMessage;
    value: RoomPublicMessageFragment;
};
type PieceLogType = {
    type: typeof pieceLog;
    value: PieceLogFragment;
};
type SoundEffectType = {
    type: typeof soundEffect;
    value: RoomSoundEffectFragment;
};
export type RoomMessage = PrivateMessageType | PublicMessageType | PieceLogType | SoundEffectType;
export type RoomMessageEvent = {
    type: typeof publicChannel;
    value: RoomPublicChannelFragment;
} | RoomMessage;
export declare const custom = "custom";
export type CustomMessage<T> = {
    type: typeof custom;
    value: T;
    createdAt: number;
};
export type Message<TCustomMessage> = CustomMessage<TCustomMessage> | RoomMessage;
export declare const reset = "reset";
type DiffBase<T> = {
    prevValue: T;
    nextValue: T;
} | {
    prevValue: T;
    nextValue: undefined;
} | {
    prevValue: undefined;
    nextValue: T;
};
export type Diff<TCustomMessage> = DiffBase<PublicMessageType> | DiffBase<PrivateMessageType> | DiffBase<PieceLogType> | DiffBase<SoundEffectType> | DiffBase<CustomMessage<TCustomMessage>> | {
    prevValue: {
        type: typeof reset;
        value: readonly Message<TCustomMessage>[];
    };
    nextValue: {
        type: typeof reset;
        value: readonly Message<TCustomMessage>[];
    };
};
export {};
//# sourceMappingURL=roomMessageTypes.d.ts.map