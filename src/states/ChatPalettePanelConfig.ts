import { castToBoolean, castToString } from '../utils/cast';
import isObject from '../utils/isObject';
import {
    castToPartialDraggablePanelConfigBase,
    DraggablePanelConfigBase,
    toCompleteDraggablePanelConfigBase,
} from './DraggablePanelConfigBase';
import * as generators from '../utils/generators';

export type ChatPalettePanelConfig = {
    selectedTextColor?: string;
    isPrivateMessageMode: boolean;
    selectedPublicChannelKey?: string;
    selectedCharacterStateId?: string;
    customCharacterName: string;
    selectedGameSystem?: string;
    isMinimized: boolean;
} & DraggablePanelConfigBase;

export type PartialChatPalettePanelConfig = Partial<ChatPalettePanelConfig>;

export const castToPartialChatPalettePanelConfig = (
    source: unknown
): PartialChatPalettePanelConfig | undefined => {
    if (!isObject<PartialChatPalettePanelConfig>(source)) {
        return;
    }

    return {
        ...castToPartialDraggablePanelConfigBase(source),
        selectedTextColor: castToString(source.selectedTextColor),
        isPrivateMessageMode: castToBoolean(source.isPrivateMessageMode),
        selectedPublicChannelKey: castToString(source.selectedPublicChannelKey),
        selectedCharacterStateId: castToString(source.selectedCharacterStateId),
        customCharacterName: castToString(source.customCharacterName),
        selectedGameSystem: castToString(source.selectedGameSystem),
        isMinimized: castToBoolean(source.isMinimized),
    };
};

export const toCompleteChatPalettePanelConfig = (
    source: PartialChatPalettePanelConfig
): ChatPalettePanelConfig => {
    return {
        ...toCompleteDraggablePanelConfigBase(source),
        selectedTextColor: source.selectedTextColor,
        isPrivateMessageMode: source.isPrivateMessageMode ?? false,
        selectedPublicChannelKey: source.selectedPublicChannelKey,
        selectedCharacterStateId: source.selectedCharacterStateId,
        customCharacterName: source.customCharacterName ?? '',
        selectedGameSystem: source.selectedGameSystem,
        isMinimized: source.isMinimized ?? false,
    };
};

export const defaultChatPalettePanelsConfig = (): Record<string, ChatPalettePanelConfig> => {
    const config: ChatPalettePanelConfig = {
        x: 50,
        y: 50,
        width: 400,
        height: 400,
        zIndex: 0,
        customCharacterName: '',
        isPrivateMessageMode: false,
        isMinimized: false,
    };
    const result: Record<string, ChatPalettePanelConfig> = {};
    const id = generators.simpleId();
    result[id] = config;
    return result;
};
