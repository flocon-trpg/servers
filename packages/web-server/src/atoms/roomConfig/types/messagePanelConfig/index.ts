import { chooseRecord } from '@flocon-trpg/utils';
import * as t from 'io-ts';
import { simpleId } from '@flocon-trpg/core';
import {
    partialMessageTabConfig,
    MessageTabConfig,
    deserializeMessageTabConfig,
} from '../messageTabConfig';
import {
    deserializeDraggablePanelConfigBase,
    DraggablePanelConfigBase,
    serializedDraggablePanelConfigBase,
} from '../draggablePanelConfig';
import { record } from '../../../../utils/io-ts/record';
import { MessageTabConfigUtils } from '../messageTabConfig/utils';
import { defaultMessagePanelPosition } from '../defaultPanelPositions';

export type MessagePanelConfig = {
    isMinimized: boolean;
    tabs: Record<string, MessageTabConfig | undefined>;
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
        tabs: record(t.string, partialMessageTabConfig),
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
        tabs: chooseRecord(source.tabs ?? {}, deserializeMessageTabConfig),
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
        tabs: { [simpleId()]: MessageTabConfigUtils.createAll({}) },
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
