import {
    DraggablePanelConfigBase,
    serializedDraggablePanelConfigBase,
    toCompleteDraggablePanelConfigBase,
} from './DraggablePanelConfigBase';
import * as generators from '../utils/generators';
import * as t from 'io-ts';
import { simpleId } from '@flocon-trpg/core';

export type ChatPalettePanelConfig = {
    selectedTextColor?: string;
    isPrivateMessageMode: boolean;
    selectedPublicChannelKey?: string;
    selectedCharacterStateId?: string;
    customCharacterName: string;
    selectedGameSystem?: string;
    isMinimized: boolean;
} & DraggablePanelConfigBase;

export const serializedChatPalettePanelConfig = t.intersection([
    t.partial({
        selectedTextColor: t.string,
        isPrivateMessageMode: t.boolean,
        selectedPublicChannelKey: t.string,
        selectedCharacterStateId: t.string,
        customCharacterName: t.string,
        selectedGameSystem: t.string,
        isMinimized: t.boolean,
    }),
    serializedDraggablePanelConfigBase,
]);

export type SerializedChatPalettePanelConfig = t.TypeOf<typeof serializedChatPalettePanelConfig>;

export const toCompleteChatPalettePanelConfig = (
    source: SerializedChatPalettePanelConfig
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
    const id = simpleId();
    result[id] = config;
    return result;
};
