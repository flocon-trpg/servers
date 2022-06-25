import * as t from 'io-ts';
import { simpleId } from '@flocon-trpg/core';
import {
    MessageTabConfig,
    deserializeMessageTabConfig,
    partialMessageTabConfig,
} from '../messageTabConfig';
import {
    DraggablePanelConfigBase,
    deserializeDraggablePanelConfigBase,
    serializedDraggablePanelConfigBase,
} from '../draggablePanelConfig';
import { MessageTabConfigUtils } from '../messageTabConfig/utils';
import { defaultMessagePanelPosition } from '../defaultPanelPositions';

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

export const serializedMessagePanelConfig = t.intersection([
    t.partial({
        isMinimized: t.boolean,
        tabs: t.array(partialMessageTabConfig),
        selectedTextColor: t.string,
        isPrivateMessageMode: t.boolean,
        selectedPublicChannelKey: t.string,
        selectedCharacterType: t.string,
        selectedCharacterId: t.string,
        customCharacterName: t.string,
        selectedGameSystem: t.string,
    }),
    serializedDraggablePanelConfigBase,
]);

export type SerializedMessagePanelConfig = t.TypeOf<typeof serializedMessagePanelConfig>;

export const deserializeMessagePanelConfig = (
    source: SerializedMessagePanelConfig
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
