import { z } from 'zod';
import { MessageFilter, deserializeMessageFilter, serializedMessageFilter } from '../messageFilter';
import { MessageFilterUtils } from '../messageFilter/utils';
import {
    PanelsConfig,
    defaultPanelsConfig,
    deserializePanelsConfig,
    serializedPanelsConfig,
} from '../panelsConfig';
import { defaultMasterVolume, defaultPanelOpacity, defaultSeVolume } from './resources';
import { record } from '@/utils/zod/record';

export type RoomConfig = {
    roomId: string;

    messageNotificationFilter: MessageFilter;
    panels: PanelsConfig;
    panelOpacity: number;
    masterVolume: number;
    channelVolumes: Record<string, number | undefined>;
    seVolume: number;
    showBackgroundBoardViewer: boolean;
};

export const serializedRoomConfig = z
    .object({
        // PartialRoomConfigはlocalforage.getItemで使われるが、localforage.setItemでは使われない。
        // getItemする際、roomIdをキーに用いるため、roomIdをストレージに保存していない。
        // そのため、RoomConfigのほうでは定義しているroomIdは、こちらでは定義していない。

        messageNotificationFilter: serializedMessageFilter,
        panels: serializedPanelsConfig,
        panelOpacity: z.number(),
        masterVolume: z.number(),
        channelVolumes: record(z.number()),
        seVolume: z.number(),
        showBackgroundBoardViewer: z.boolean(),
    })
    .partial();

export type SerializedRoomConfig = z.TypeOf<typeof serializedRoomConfig>;

export const deserializeRoomConfig = (source: SerializedRoomConfig, roomId: string): RoomConfig => {
    return {
        roomId,
        panels:
            source.panels == null ? defaultPanelsConfig() : deserializePanelsConfig(source.panels),
        messageNotificationFilter: deserializeMessageFilter(source.messageNotificationFilter ?? {}),
        panelOpacity: source.panelOpacity ?? defaultPanelOpacity,
        masterVolume: source.masterVolume ?? defaultMasterVolume,
        channelVolumes: source.channelVolumes ?? {},
        seVolume: source.seVolume ?? defaultSeVolume,
        showBackgroundBoardViewer: source.showBackgroundBoardViewer ?? true,
    };
};

export const defaultRoomConfig = (roomId: string): RoomConfig => {
    return {
        roomId,
        panels: defaultPanelsConfig(),
        messageNotificationFilter: MessageFilterUtils.createAll(),
        panelOpacity: defaultPanelOpacity,
        masterVolume: defaultMasterVolume,
        channelVolumes: {},
        seVolume: defaultSeVolume,
        showBackgroundBoardViewer: true,
    };
};
