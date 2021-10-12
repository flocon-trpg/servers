import {
    DraggablePanelConfigBase,
    serializedDraggablePanelConfigBase,
    toCompleteDraggablePanelConfigBase,
} from './DraggablePanelConfigBase';
import * as generators from '../utils/generators';
import { chooseRecord } from '@kizahasi/util';
import * as t from 'io-ts';
import { record } from '../utils/io-ts/record';
import { simpleId } from '@kizahasi/flocon-core';

export type MessageFilter = {
    showNotification: boolean;
    showSystem: boolean;
    showFree: boolean;
    showPublic1: boolean;
    showPublic2: boolean;
    showPublic3: boolean;
    showPublic4: boolean;
    showPublic5: boolean;
    showPublic6: boolean;
    showPublic7: boolean;
    showPublic8: boolean;
    showPublic9: boolean;
    showPublic10: boolean;
    // trueならばプライベートメッセージをすべて含める、falseならすべて除外。stringならばPrivateChannelSetsを表し、そのプライベートメッセージのみ含める。
    privateChannels: string | boolean;
};

export const serializedMessageFilter = t.partial({
    showNotification: t.boolean,
    showSystem: t.boolean,
    showFree: t.boolean,
    showPublic1: t.boolean,
    showPublic2: t.boolean,
    showPublic3: t.boolean,
    showPublic4: t.boolean,
    showPublic5: t.boolean,
    showPublic6: t.boolean,
    showPublic7: t.boolean,
    showPublic8: t.boolean,
    showPublic9: t.boolean,
    showPublic10: t.boolean,
    privateChannels: t.union([t.string, t.boolean]),
});

export type SerializedMessageFilter = t.TypeOf<typeof serializedMessageFilter>;

export type TabConfig = {
    // nullishならば自動で名付けられる
    tabName?: string;
} & MessageFilter;

export const partialTabConfig = t.intersection([
    t.partial({
        tabName: t.string,
    }),
    serializedMessageFilter,
]);

export type PartialTabConfig = t.TypeOf<typeof partialTabConfig>;

export namespace MessageFilter {
    export const isEmpty = (source: MessageFilter): boolean => {
        return (
            source.privateChannels === false &&
            !source.showNotification &&
            !source.showFree &&
            !source.showPublic1 &&
            !source.showPublic10 &&
            !source.showPublic2 &&
            !source.showPublic3 &&
            !source.showPublic4 &&
            !source.showPublic5 &&
            !source.showPublic6 &&
            !source.showPublic7 &&
            !source.showPublic8 &&
            !source.showPublic9 &&
            !source.showSystem
        );
    };

    export const isAll = (source: MessageFilter): boolean => {
        return (
            source.privateChannels === true &&
            source.showNotification &&
            source.showFree &&
            source.showPublic1 &&
            source.showPublic10 &&
            source.showPublic2 &&
            source.showPublic3 &&
            source.showPublic4 &&
            source.showPublic5 &&
            source.showPublic6 &&
            source.showPublic7 &&
            source.showPublic8 &&
            source.showPublic9 &&
            source.showSystem
        );
    };

    export const createEmpty = (): MessageFilter => {
        return {
            privateChannels: false,
            showNotification: false,
            showFree: false,
            showPublic1: false,
            showPublic10: false,
            showPublic2: false,
            showPublic3: false,
            showPublic4: false,
            showPublic5: false,
            showPublic6: false,
            showPublic7: false,
            showPublic8: false,
            showPublic9: false,
            showSystem: false,
        };
    };

    export const createAll = (): MessageFilter => {
        return {
            privateChannels: true,
            showNotification: true,
            showFree: true,
            showPublic1: true,
            showPublic10: true,
            showPublic2: true,
            showPublic3: true,
            showPublic4: true,
            showPublic5: true,
            showPublic6: true,
            showPublic7: true,
            showPublic8: true,
            showPublic9: true,
            showSystem: true,
        };
    };
}

export namespace TabConfig {
    export const createEmpty = ({ tabName }: { tabName?: string }): TabConfig => {
        return {
            ...MessageFilter.createEmpty(),
            tabName,
        };
    };

    export const createAll = ({ tabName }: { tabName?: string }): TabConfig => {
        return {
            ...MessageFilter.createAll(),
            tabName,
        };
    };

    export const toTabName = (source: TabConfig): string => {
        if (source.tabName != null && source.tabName !== '') {
            return source.tabName;
        }
        if (MessageFilter.isAll(source)) {
            return '全てのメッセージ';
        }
        if (MessageFilter.isEmpty(source)) {
            return '(空のタブ)';
        }
        const elements: string[] = [];
        if (source.showSystem) {
            elements.push('システムメッセージ');
        }
        if (source.showFree) {
            elements.push('雑談');
        }

        // TODO: 現在はビルドを通すためだけに暫定の名前を返している
        return '(タブ)';
    };
}
export const toCompleteMessageFilter = (source: SerializedMessageFilter): MessageFilter => {
    return {
        privateChannels: source.privateChannels ?? false,
        showNotification: source.showNotification ?? false,
        showFree: source.showFree ?? false,
        showPublic10: source.showPublic10 ?? false,
        showPublic1: source.showPublic1 ?? false,
        showPublic2: source.showPublic2 ?? false,
        showPublic3: source.showPublic3 ?? false,
        showPublic4: source.showPublic4 ?? false,
        showPublic5: source.showPublic5 ?? false,
        showPublic6: source.showPublic6 ?? false,
        showPublic7: source.showPublic7 ?? false,
        showPublic8: source.showPublic8 ?? false,
        showPublic9: source.showPublic9 ?? false,
        showSystem: source.showSystem ?? false,
    };
};

export const toCompleteTabConfig = (source: PartialTabConfig): TabConfig => {
    return {
        ...toCompleteMessageFilter(source),
        tabName: source.tabName,
    };
};

export type MessagePanelConfig = {
    isMinimized: boolean;
    tabs: Record<string, TabConfig | undefined>;
    selectedTextColor?: string;
    isPrivateMessageMode: boolean;
    selectedPublicChannelKey?: string;
    selectedCharacterType?: string;
    selectedCharacterStateId?: string;
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
        selectedCharacterStateId: t.string,
        customCharacterName: t.string,
        selectedGameSystem: t.string,
    }),
    serializedDraggablePanelConfigBase,
]);

export type SerializedMessagePanelConfig = t.TypeOf<typeof serializedMessagePanelConfig>;

export const toCompleteMessagePanelConfig = (
    source: SerializedMessagePanelConfig
): MessagePanelConfig => {
    return {
        ...toCompleteDraggablePanelConfigBase(source),
        isMinimized: source.isMinimized ?? false,
        tabs: chooseRecord(source.tabs ?? {}, toCompleteTabConfig),
        selectedTextColor: source.selectedTextColor,
        isPrivateMessageMode: source.isPrivateMessageMode ?? false,
        selectedPublicChannelKey: source.selectedPublicChannelKey,
        selectedCharacterType: source.selectedCharacterType,
        selectedCharacterStateId: source.selectedCharacterStateId,
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
        tabs: { [simpleId()]: TabConfig.createAll({}) },
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
