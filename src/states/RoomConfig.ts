import { castToString } from '../utils/cast';
import isObject from '../utils/isObject';
import { castToPartialPanelsConfig, defaultPanelsConfig, PanelsConfig, PartialPanelsConfig, toCompletePanelsConfig } from './PanelsConfig';
import * as Room from '../stateManagers/states/room';

export type RoomConfig = {
    roomId: string;

    version: 1;
    gameType?: string;
    panels: PanelsConfig;
}

export type PartialRoomConfig = {
    // PartialRoomConfigはlocalforage.getItemで使われるが、localforage.setItemでは使われない。
    // getItemする際、roomIdをキーに用いるため、roomIdをストレージに保存する必要はない。
    // そのため、RoomConfigのほうでは定義しているroomIdは、こちらでは定義していない。

    version?: number;
    gameType?: string;
    panels?: PartialPanelsConfig;
}

export type UpdateGameTypeAction = {
    roomId: string;
    gameType?: string;
}

export const boardsPanel = 'boardsPanel';
export const charactersPanel = 'charactersPanel';
export const gameEffectPanel = 'gameEffectPanel';
export const messagesPanel = 'messagesPanel';

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
    };
}

export const castToPartialRoomConfig = (source: unknown): PartialRoomConfig | undefined => {
    if (!isObject<PartialRoomConfig>(source)) {
        return;
    }
    return {
        version: 1,
        panels: castToPartialPanelsConfig(source.panels),
        gameType: castToString(source.gameType),
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
        gameType: source.gameType,
    };
};

export const defaultRoomConfig = (roomId: string): RoomConfig => {
    return {
        roomId,
        version: 1,
        panels: defaultPanelsConfig(),
    };
};