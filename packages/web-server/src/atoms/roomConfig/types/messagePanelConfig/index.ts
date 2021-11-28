import { chooseRecord } from '@flocon-trpg/utils';
import * as t from 'io-ts';
import { simpleId } from '@flocon-trpg/core';
import { partialTabConfig, TabConfig, deserializeTabConfig } from '../tabConfig';
import {
    deserializeDraggablePanelConfigBase,
    DraggablePanelConfigBase,
    serializedDraggablePanelConfigBase,
} from '../draggablePanelConfig';
import { record } from '../../../../utils/io-ts/record';
import { TabConfigUtils } from '../tabConfig/utils';

export type MessagePanelConfig = {
    isMinimized: boolean;
    tabs: Record<string, TabConfig | undefined>;
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
        tabs: record(t.string, partialTabConfig),
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
        tabs: chooseRecord(source.tabs ?? {}, deserializeTabConfig),
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
        x: 0,
        y: 400,
        width: 300,
        height: 300,
        zIndex: 0,
        isMinimized: false,
        tabs: { [simpleId()]: TabConfigUtils.createAll({}) },
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
