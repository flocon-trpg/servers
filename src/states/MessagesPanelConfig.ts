import { ReadonlyStateToReduce } from '../hooks/useRoomMessages';
import { castToArray, castToBoolean, castToNumber, castToRecord, castToString } from '../utils/cast';
import isObject from '../utils/isObject';
import { chooseRecord } from '../utils/record';
import { castToPartialDraggablePanelConfigBase, DraggablePanelConfigBase, toCompleteDraggablePanelConfigBase } from './DraggablePanelConfigBase';
import * as generators from '../utils/generators';
import { __ } from '../@shared/collection';

export type MessageFilter = {
    showLog: boolean;
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
}

export type TabConfig = {
    // keyとcreatedAtはReactのkeyに使われる
    key: string;
    createdAt: number;

    // nullishならば自動で名付けられる
    tabName?: string;
} & MessageFilter;

export namespace MessageFilter {
    export const isEmpty = (source: MessageFilter): boolean => {
        return source.privateChannels === false
            && !source.showLog
            && !source.showFree
            && !source.showPublic1
            && !source.showPublic10
            && !source.showPublic2
            && !source.showPublic3
            && !source.showPublic4
            && !source.showPublic5
            && !source.showPublic6
            && !source.showPublic7
            && !source.showPublic8
            && !source.showPublic9
            && !source.showSystem;
    };

    export const isAll = (source: MessageFilter): boolean => {
        return source.privateChannels === true
            && source.showLog
            && source.showFree
            && source.showPublic1
            && source.showPublic10
            && source.showPublic2
            && source.showPublic3
            && source.showPublic4
            && source.showPublic5
            && source.showPublic6
            && source.showPublic7
            && source.showPublic8
            && source.showPublic9
            && source.showSystem;
    };

    export const createEmpty = (): MessageFilter => {
        return {
            privateChannels: false,
            showLog: false,
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
            showLog: true,
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
            key: generators.simpleId(),
            createdAt: new Date().getTime(),
        };
    };

    export const createAll = ({ tabName }: { tabName?: string }): TabConfig => {
        return {
            ...MessageFilter.createAll(),
            tabName,
            key: generators.simpleId(),
            createdAt: new Date().getTime(),
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

export type PartialMessageFilter = Partial<MessageFilter>;
export type PartialTabConfig = Partial<TabConfig>;

export const castToPartialMessageFilter = (source: unknown): PartialMessageFilter | undefined => {
    if (!isObject<PartialMessageFilter>(source)) {
        return;
    }
    return {
        privateChannels: castToBoolean(source.privateChannels) ?? castToString(source.privateChannels),
        showLog: castToBoolean(source.showLog),
        showFree: castToBoolean(source.showFree),
        showPublic10: castToBoolean(source.showPublic10),
        showPublic1: castToBoolean(source.showPublic1),
        showPublic2: castToBoolean(source.showPublic2),
        showPublic3: castToBoolean(source.showPublic3),
        showPublic4: castToBoolean(source.showPublic4),
        showPublic5: castToBoolean(source.showPublic5),
        showPublic6: castToBoolean(source.showPublic6),
        showPublic7: castToBoolean(source.showPublic7),
        showPublic8: castToBoolean(source.showPublic8),
        showPublic9: castToBoolean(source.showPublic9),
        showSystem: castToBoolean(source.showSystem),
    };
};

export const toCompleteMessageFilter = (source: PartialMessageFilter): MessageFilter => {
    return {
        privateChannels: source.privateChannels ?? false,
        showLog: source.showLog ?? false,
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

export const castToPartialTabConfig = (source: unknown): PartialTabConfig | undefined => {
    if (!isObject<PartialTabConfig>(source)) {
        return;
    }
    return {
        ...castToPartialMessageFilter(source),
        createdAt: castToNumber(source.createdAt),
        key: castToString(source.key),
        tabName: castToString(source.tabName),
    };
};

export const toCompleteTabConfig = (source: PartialTabConfig): TabConfig => {
    return {
        ...toCompleteMessageFilter(source),
        createdAt: source.createdAt ?? new Date().getTime(),
        key: source.key ?? generators.simpleId(),
        tabName: source.tabName,
    };
};

export type MessagePanelConfig = {
    isMinimized: boolean;
    tabs: TabConfig[];
    selectedChannelType?: string;
    selectedPublicChannelKey?: string;
    selectedCharacterType?: string;
    selectedCharacterStateId?: string;
    customCharacterName: string;
    selectedGameSystem?: string;
} & DraggablePanelConfigBase

export type PartialMessagePanelConfig = Partial<MessagePanelConfig>;

export const castToPartialMessagePanelConfig = (source: unknown): PartialMessagePanelConfig | undefined => {
    if (!isObject<PartialMessagePanelConfig>(source)) {
        return;
    }
    return {
        ...castToPartialDraggablePanelConfigBase(source),
        isMinimized: castToBoolean(source.isMinimized),
        tabs: castToArray(source.tabs, castToPartialTabConfig)?.map(toCompleteTabConfig),
        selectedChannelType: castToString(source.selectedChannelType),
        selectedPublicChannelKey: castToString(source.selectedPublicChannelKey),
        selectedCharacterType: castToString(source.selectedCharacterType),
        selectedCharacterStateId: castToString(source.selectedCharacterStateId),
        customCharacterName: castToString(source.customCharacterName),
        selectedGameSystem: castToString(source.selectedGameSystem),
    };
};

export const toCompleteMessagePanelConfig = (source: PartialMessagePanelConfig): MessagePanelConfig => {
    return {
        ...toCompleteDraggablePanelConfigBase(source),
        isMinimized: source.isMinimized ?? false,
        tabs: source.tabs ?? [],
        selectedChannelType: source.selectedChannelType,
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
        tabs: [],
        customCharacterName: '',
    };
}

export const defaultMessagePanelsConfig = (): Record<string, MessagePanelConfig> => {
    const result: Record<string, MessagePanelConfig> = {};
    const id = generators.simpleId();
    result[id] = defaultMessagePanelConfig();
    return result;
};