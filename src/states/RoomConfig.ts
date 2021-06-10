import { castToNumber, castToRecord, castToString } from '../utils/cast';
import isObject from '../utils/isObject';
import { castToPartialPanelsConfig, defaultPanelsConfig, PanelsConfig, PartialPanelsConfig, toCompletePanelsConfig } from './PanelsConfig';
import * as Room from '../stateManagers/states/room';
import { MessageFilter } from './MessagePanelConfig';

export const defaultMasterVolume = 0.5;
export const defaultChannelVolume = 1;
export const defaultSeVolume = 1;

export type RoomConfig = {
    roomId: string;

    version: 1;
    messageNotificationFilter: MessageFilter;
    panels: PanelsConfig;
    masterVolume: number;
    channelVolumes: Record<string, number>;
    seVolume: number;
}

export type PartialRoomConfig = {
    // PartialRoomConfigはlocalforage.getItemで使われるが、localforage.setItemでは使われない。
    // getItemする際、roomIdをキーに用いるため、roomIdをストレージに保存していない。
    // そのため、RoomConfigのほうでは定義しているroomIdは、こちらでは定義していない。

    version?: number;
    messageNotificationFilter?: MessageFilter;
    panels?: PartialPanelsConfig;
    masterVolume?: number;
    channelVolumes?: Record<string, number>;
    seVolume?: number;
}

export type UpdateGameSystemAction = {
    roomId: string;
    gameSystem: {
        id: string;
        name: string;
    } | undefined;
}

export const activeBoardPanel = 'activeBoardPanel';
export const boardEditorPanel = 'boardEditorPanel';
export const characterPanel = 'characterPanel';
export const gameEffectPanel = 'gameEffectPanel';
export const memoPanel = 'memoPanel';
export const messagePanel = 'messagePanel';
export const participantPanel = 'participantPanel';
export const pieceValuePanel = 'pieceValuePanel';

export type PanelAction = {
    roomId: string;
    target: {
        type: typeof activeBoardPanel;
    } | {
        type: typeof boardEditorPanel;
        panelId: string;
    } | {
        type: typeof characterPanel;
    } | {
        type: typeof gameEffectPanel;
    } | {
        type: typeof memoPanel;
        panelId: string;
    } | {
        type: typeof messagePanel;
        panelId: string;
    } | {
        type: typeof participantPanel;
    } | {
        type: typeof pieceValuePanel;
    };
}

export const castToPartialRoomConfig = (source: unknown): PartialRoomConfig | undefined => {
    if (!isObject<PartialRoomConfig>(source)) {
        return;
    }
    return {
        version: 1,
        panels: castToPartialPanelsConfig(source.panels),
        masterVolume: castToNumber(source.masterVolume),
        channelVolumes: castToRecord(source.channelVolumes, castToNumber),
        seVolume: castToNumber(source.seVolume),
    };
};

// versionが未対応のものの場合はundefinedを返す。
// TODO: Configをユーザーがリセットできないと、versionが不正になってしまったときに永遠に使用できなくなる問題への対処。
export const toCompleteRoomConfig = (source: PartialRoomConfig, roomId: string): RoomConfig | undefined => {
    if (source.version !== 1) {
        return;
    }
    return {
        roomId,
        version: source.version,
        panels: source.panels == null ? defaultPanelsConfig() : toCompletePanelsConfig(source.panels),
        messageNotificationFilter: source.messageNotificationFilter ?? MessageFilter.createAll(),
        masterVolume: source.masterVolume ?? defaultMasterVolume,
        channelVolumes: source.channelVolumes ?? {},
        seVolume: source.seVolume ?? defaultSeVolume,
    };
};

export const defaultRoomConfig = (roomId: string): RoomConfig => {
    return {
        roomId,
        version: 1,
        panels: defaultPanelsConfig(),
        messageNotificationFilter: MessageFilter.createAll(),
        masterVolume: defaultMasterVolume,
        channelVolumes: {},
        seVolume: defaultSeVolume,
    };
};