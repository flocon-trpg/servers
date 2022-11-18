import { PieceLogFragment, RoomPrivateMessageFragment, RoomPublicChannelFragment, RoomPublicMessageFragment, RoomSoundEffectFragment } from '@flocon-trpg/typed-document-node-v0.7.1';
export declare const privateMessage = "privateMessage";
export declare const publicMessage = "publicMessage";
export declare const pieceLog = "pieceLog";
export declare const publicChannel = "publicChannel";
export declare const soundEffect = "soundEffect";
declare type PrivateMessageType = {
    type: typeof privateMessage;
    value: RoomPrivateMessageFragment;
};
declare type PublicMessageType = {
    type: typeof publicMessage;
    value: RoomPublicMessageFragment;
};
declare type PieceLogType = {
    type: typeof pieceLog;
    value: PieceLogFragment;
};
declare type SoundEffectType = {
    type: typeof soundEffect;
    value: RoomSoundEffectFragment;
};
export declare type RoomMessage = PrivateMessageType | PublicMessageType | PieceLogType | SoundEffectType;
export declare type RoomMessageEvent = {
    type: typeof publicChannel;
    value: RoomPublicChannelFragment;
} | RoomMessage;
export declare const custom = "custom";
export declare type CustomMessage<T> = {
    type: typeof custom;
    value: T;
    createdAt: number;
};
export declare type Message<TCustomMessage> = CustomMessage<TCustomMessage> | RoomMessage;
export declare const reset = "reset";
declare type DiffBase<T> = {
    prevValue: T;
    nextValue: T;
} | {
    prevValue: T;
    nextValue: undefined;
} | {
    prevValue: undefined;
    nextValue: T;
};
export declare type Diff<TCustomMessage> = DiffBase<PublicMessageType> | DiffBase<PrivateMessageType> | DiffBase<PieceLogType> | DiffBase<SoundEffectType> | DiffBase<CustomMessage<TCustomMessage>> | {
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