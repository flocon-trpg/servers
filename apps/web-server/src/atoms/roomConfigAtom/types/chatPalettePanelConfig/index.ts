import { simpleId } from '@flocon-trpg/core';
import { z } from 'zod';
import { defaultChatPalettePanelPosition } from '../defaultPanelPositions';
import {
    DraggablePanelConfigBase,
    deserializeDraggablePanelConfigBase,
    serializedDraggablePanelConfigBase,
} from '../draggablePanelConfig';

export type ChatPalettePanelConfig = {
    selectedTextColor?: string;
    isPrivateMessageMode: boolean;
    selectedPublicChannelKey?: string;
    selectedCharacterId?: string;
    customCharacterName: string;
    selectedGameSystem?: string;
    isMinimized: boolean;
} & DraggablePanelConfigBase;

export const serializedChatPalettePanelConfig = z
    .object({
        selectedTextColor: z.string(),
        isPrivateMessageMode: z.boolean(),
        selectedPublicChannelKey: z.string(),
        selectedCharacterId: z.string(),
        customCharacterName: z.string(),
        selectedGameSystem: z.string(),
        isMinimized: z.boolean(),
    })
    .partial()
    .merge(serializedDraggablePanelConfigBase);

export type SerializedChatPalettePanelConfig = z.TypeOf<typeof serializedChatPalettePanelConfig>;

export const deserializeChatPalettePanelConfig = (
    source: SerializedChatPalettePanelConfig,
): ChatPalettePanelConfig => {
    return {
        ...deserializeDraggablePanelConfigBase(source),
        selectedTextColor: source.selectedTextColor,
        isPrivateMessageMode: source.isPrivateMessageMode ?? false,
        selectedPublicChannelKey: source.selectedPublicChannelKey,
        selectedCharacterId: source.selectedCharacterId,
        customCharacterName: source.customCharacterName ?? '',
        selectedGameSystem: source.selectedGameSystem,
        isMinimized: source.isMinimized ?? false,
    };
};

export const defaultChatPalettePanelsConfig = (): Record<string, ChatPalettePanelConfig> => {
    const config: ChatPalettePanelConfig = {
        ...defaultChatPalettePanelPosition,
        customCharacterName: '',
        isPrivateMessageMode: false,
    };
    const result: Record<string, ChatPalettePanelConfig> = {};
    const id = simpleId();
    result[id] = config;
    return result;
};
