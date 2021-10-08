import {
    defaultPanelsConfig,
    PanelsConfig,
    serializedPanelsConfig,
    toCompletePanelsConfig,
} from './PanelsConfig';
import {
    MessageFilter,
    serializedMessageFilter,
    toCompleteMessageFilter,
} from './MessagePanelConfig';
import * as t from 'io-ts';
import { record } from '../utils/io-ts/record';

export const defaultMasterVolume = 0.5;
export const defaultChannelVolume = 1;
export const defaultSeVolume = 1;

export type RoomConfig = {
    roomId: string;

    messageNotificationFilter: MessageFilter;
    panels: PanelsConfig;
    masterVolume: number;
    channelVolumes: Record<string, number | undefined>;
    seVolume: number;
};

export const serializedRoomConfig = t.partial({
    // PartialRoomConfigはlocalforage.getItemで使われるが、localforage.setItemでは使われない。
    // getItemする際、roomIdをキーに用いるため、roomIdをストレージに保存していない。
    // そのため、RoomConfigのほうでは定義しているroomIdは、こちらでは定義していない。

    messageNotificationFilter: serializedMessageFilter,
    panels: serializedPanelsConfig,
    masterVolume: t.number,
    channelVolumes: record(t.string, t.number),
    seVolume: t.number,
});

export type SerializedRoomConfig = t.TypeOf<typeof serializedRoomConfig>;

export type UpdateGameSystemAction = {
    roomId: string;
    gameSystem:
        | {
              id: string;
              name: string;
          }
        | undefined;
};

export const activeBoardPanel = 'activeBoardPanel';
export const boardEditorPanel = 'boardEditorPanel';
export const characterPanel = 'characterPanel';
export const chatPalettePanel = 'chatPalettePanel';
export const gameEffectPanel = 'gameEffectPanel';
export const memoPanel = 'memoPanel';
export const messagePanel = 'messagePanel';
export const participantPanel = 'participantPanel';
export const pieceValuePanel = 'pieceValuePanel';

export type PanelAction = {
    roomId: string;
    target:
        | {
              type: typeof activeBoardPanel;
          }
        | {
              type: typeof boardEditorPanel;
              panelId: string;
          }
        | {
              type: typeof characterPanel;
          }
        | {
              type: typeof chatPalettePanel;
              panelId: string;
          }
        | {
              type: typeof gameEffectPanel;
          }
        | {
              type: typeof memoPanel;
              panelId: string;
          }
        | {
              type: typeof messagePanel;
              panelId: string;
          }
        | {
              type: typeof participantPanel;
          }
        | {
              type: typeof pieceValuePanel;
          };
};

export const toCompleteRoomConfig = (source: SerializedRoomConfig, roomId: string): RoomConfig => {
    return {
        roomId,
        panels:
            source.panels == null ? defaultPanelsConfig() : toCompletePanelsConfig(source.panels),
        messageNotificationFilter: toCompleteMessageFilter(source.messageNotificationFilter ?? {}),
        masterVolume: source.masterVolume ?? defaultMasterVolume,
        channelVolumes: source.channelVolumes ?? {},
        seVolume: source.seVolume ?? defaultSeVolume,
    };
};

export const defaultRoomConfig = (roomId: string): RoomConfig => {
    return {
        roomId,
        panels: defaultPanelsConfig(),
        messageNotificationFilter: MessageFilter.createAll(),
        masterVolume: defaultMasterVolume,
        channelVolumes: {},
        seVolume: defaultSeVolume,
    };
};
