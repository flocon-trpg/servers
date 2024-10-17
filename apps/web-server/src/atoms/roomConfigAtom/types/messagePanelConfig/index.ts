import { simpleId } from '@flocon-trpg/core';
import { z } from 'zod';
import { defaultMessagePanelPosition } from '../defaultPanelPositions';
import {
    DraggablePanelConfigBase,
    deserializeDraggablePanelConfigBase,
    serializedDraggablePanelConfigBase,
} from '../draggablePanelConfig';
import {
    MessageTabConfig,
    deserializeMessageTabConfig,
    partialMessageTabConfig,
} from '../messageTabConfig';
import { MessageTabConfigUtils } from '../messageTabConfig/utils';

export type MessagePanelConfig = {
    isMinimized: boolean;
    tabs: MessageTabConfig[];
    selectedTextColor?: string;
    isPrivateMessageMode: boolean;
    selectedPublicChannelKey?: string;
    selectedCharacterType?: string;
    selectedCharacterId?: string;
    customCharacterName: string;
    selectedGameSystem?: string;
} & DraggablePanelConfigBase;

export const serializedMessagePanelConfig = z
    .object({
        isMinimized: z.boolean(),
        tabs: z.array(partialMessageTabConfig),
        selectedTextColor: z.string(),
        isPrivateMessageMode: z.boolean(),
        selectedPublicChannelKey: z.string(),
        selectedCharacterType: z.string(),
        selectedCharacterId: z.string(),
        customCharacterName: z.string(),
        selectedGameSystem: z.string(),
    })
    .partial()
    .merge(serializedDraggablePanelConfigBase);

export type SerializedMessagePanelConfig = z.TypeOf<typeof serializedMessagePanelConfig>;

export const deserializeMessagePanelConfig = (
    source: SerializedMessagePanelConfig,
): MessagePanelConfig => {
    return {
        ...deserializeDraggablePanelConfigBase(source),
        isMinimized: source.isMinimized ?? false,
        tabs: (source.tabs ?? []).map(deserializeMessageTabConfig),
        selectedTextColor: source.selectedTextColor,
        isPrivateMessageMode: source.isPrivateMessageMode ?? false,
        selectedPublicChannelKey: source.selectedPublicChannelKey,
        selectedCharacterType: source.selectedCharacterType,
        selectedCharacterId: source.selectedCharacterId,
        customCharacterName: source.customCharacterName ?? '',
        selectedGameSystem: source.selectedGameSystem,
    };
};

export const defaultMessagePanelConfig = (): MessagePanelConfig => {
    return {
        ...defaultMessagePanelPosition,
        tabs: [MessageTabConfigUtils.createAll({})],
        isPrivateMessageMode: false,
        customCharacterName: '',
    };
};

export const defaultMessagePanelsConfig = (): Record<string, MessagePanelConfig> => {
    const result: Record<string, MessagePanelConfig> = {};
    const id = simpleId();
    result[id] = defaultMessagePanelConfig();
    return result;
};
