import { castToNumber, castToRecord, castToString } from '../utils/cast';
import isObject from '../utils/isObject';
import { castToPartialPanelsConfig, defaultPanelsConfig, PanelsConfig, PartialPanelsConfig, toCompletePanelsConfig } from './PanelsConfig';
import * as Room from '../stateManagers/states/room';

export type RoomConfig = {
    roomId: string;

    version: 1;
    gameTypeId?: string;
    gameTypeName?: string;
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
    gameTypeId?: string;
    gameTypeName?: string;
    panels?: PartialPanelsConfig;
    masterVolume?: number;
    channelVolumes?: Record<string, number>;
    seVolume?: number;
}

export type UpdateGameTypeAction = {
    roomId: string;
    gameType: {
        id: string;
        name: string;
    } | undefined;
}

export const boardsPanel = 'boardsPanel';
export const charactersPanel = 'charactersPanel';
export const gameEffectPanel = 'gameEffectPanel';
export const messagesPanel = 'messagesPanel';
export const participantsPanel = 'participantsPanel';

export type PanelAction = {
    roomId: string;
    target: {
        type: typeof boardsPanel;
        panelId: string;
    } | {
        type: typeof charactersPanel;
    } | {
        type: typeof gameEffectPanel;
    } | {
        type: typeof messagesPanel;
    } | {
        type: typeof participantsPanel;
    };
}

export const castToPartialRoomConfig = (source: unknown): PartialRoomConfig | undefined => {
    if (!isObject<PartialRoomConfig>(source)) {
        return;
    }
    return {
        version: 1,
        panels: castToPartialPanelsConfig(source.panels),
        gameTypeId: castToString(source.gameTypeId),
        gameTypeName: castToString(source.gameTypeName),
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
        gameTypeId: source.gameTypeId,
        gameTypeName: source.gameTypeName,
        masterVolume: source.masterVolume ?? 0.5,
        channelVolumes: source.channelVolumes ?? {},
        seVolume: source.seVolume ?? 1,
    };
};

export const defaultRoomConfig = (roomId: string): RoomConfig => {
    return {
        roomId,
        version: 1,
        panels: defaultPanelsConfig(),
        masterVolume: 0.5,
        channelVolumes: {},
        seVolume: 1,
    };
};