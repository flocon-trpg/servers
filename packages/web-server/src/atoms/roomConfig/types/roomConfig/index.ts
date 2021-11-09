import * as t from 'io-ts';
import { record } from '../../../../utils/io-ts/record';
import { deserializeMessageFilter, MessageFilter, serializedMessageFilter } from '../messageFilter';
import { MessageFilterUtils } from '../messageFilter/utils';
import {
    defaultPanelsConfig,
    deserializePanelsConfig,
    PanelsConfig,
    serializedPanelsConfig,
} from '../panelsConfig';
import { defaultMasterVolume, defaultSeVolume } from './resources';

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

export const deserializeRoomConfig = (source: SerializedRoomConfig, roomId: string): RoomConfig => {
    return {
        roomId,
        panels:
            source.panels == null ? defaultPanelsConfig() : deserializePanelsConfig(source.panels),
        messageNotificationFilter: deserializeMessageFilter(source.messageNotificationFilter ?? {}),
        masterVolume: source.masterVolume ?? defaultMasterVolume,
        channelVolumes: source.channelVolumes ?? {},
        seVolume: source.seVolume ?? defaultSeVolume,
    };
};

export const defaultRoomConfig = (roomId: string): RoomConfig => {
    return {
        roomId,
        panels: defaultPanelsConfig(),
        messageNotificationFilter: MessageFilterUtils.createAll(),
        masterVolume: defaultMasterVolume,
        channelVolumes: {},
        seVolume: defaultSeVolume,
    };
};
