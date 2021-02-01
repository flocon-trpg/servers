import { ReadonlyStateToReduce } from '../hooks/useRoomMessages';
import { castToBoolean, castToRecord, castToString } from '../utils/cast';
import isObject from '../utils/isObject';
import { chooseRecord } from '../utils/record';
import { castToPartialDraggablePanelConfigBase, DraggablePanelConfigBase, toCompleteDraggablePanelConfigBase } from './DraggablePanelConfigBase';

export type ChannelConfig = {
    // undefinedのときはデフォルトの動作（メッセージがあるときのみ表示）。
    show?: boolean;
}

export type PartialChannelConfig = Partial<ChannelConfig>;

const castToCompleteChatChannelConfig = (source: unknown): ChannelConfig | undefined => {
    if (!isObject<PartialChannelConfig>(source)) {
        return;
    }
    return {
        show: castToBoolean(source.show),
    };
};

export type MessagesPanelConfig = {
    isMinimized: boolean;
    channels: Record<string, ChannelConfig>;
} & DraggablePanelConfigBase

export type PartialMessagesPanelConfig = Partial<MessagesPanelConfig>;

export const castToPartialMessagesPanelConfig = (source: unknown): PartialMessagesPanelConfig | undefined => {
    if (!isObject<PartialMessagesPanelConfig>(source)) {
        return;
    }
    return {
        ...castToPartialDraggablePanelConfigBase(source),
        isMinimized: castToBoolean(source.isMinimized),
    };
};

export const toCompleteMessagesPanelConfig = (source: PartialMessagesPanelConfig): MessagesPanelConfig => {
    return {
        ...toCompleteDraggablePanelConfigBase(source),
        channels: castToRecord(source.channels, castToCompleteChatChannelConfig) ?? {},
        isMinimized: source.isMinimized ?? false,
    };
};

export const defaultMessagesPanelConfig = (): MessagesPanelConfig => {
    return {
        x: 0,
        y: 400,
        width: 300,
        height: 300,
        zIndex: 0,
        isMinimized: false,
        channels: {},
    };
};

