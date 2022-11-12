import {
    PieceLogFragment,
    RoomPrivateMessageFragment,
    RoomPublicChannelFragment,
    RoomPublicMessageFragment,
    RoomSoundEffectFragment,
} from '@flocon-trpg/typed-document-node-v0.7.1';

export const privateMessage = 'privateMessage';
export const publicMessage = 'publicMessage';
export const pieceLog = 'pieceLog';
export const publicChannel = 'publicChannel';
export const soundEffect = 'soundEffect';

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

export type RoomMessageEvent =
    | {
          type: typeof publicChannel;
          value: RoomPublicChannelFragment;
      }
    | RoomMessage;

export const custom = 'custom';

export type CustomMessage<T> = {
    type: typeof custom;
    value: T;
    createdAt: number;
    /** CustomMessage ごとに異なる値をセットします。`createdAt` と `key` がともに等しい CustomMessage は同一であるとみなされます。 */
    key: string | number;
};

export type Message<TCustomMessage> = CustomMessage<TCustomMessage> | RoomMessage;

export const reset = 'reset';

type DiffBase<T> =
    | {
          prevValue: T;
          nextValue: T;
      }
    | {
          prevValue: T;
          nextValue: undefined;
      }
    | {
          prevValue: undefined;
          nextValue: T;
      };

export type Diff<TCustomMessage> =
    | DiffBase<PublicMessageType>
    | DiffBase<PrivateMessageType>
    | DiffBase<PieceLogType>
    | DiffBase<SoundEffectType>
    | DiffBase<CustomMessage<TCustomMessage>>
    | {
          prevValue: { type: typeof reset; value: readonly Message<TCustomMessage>[] };
          nextValue: { type: typeof reset; value: readonly Message<TCustomMessage>[] };
      };
