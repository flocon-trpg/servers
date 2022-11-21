import { strIndex10Array } from '@flocon-trpg/core';
import React from 'react';
import { usePublicChannelNames } from '../../../../../hooks/usePublicChannelNames';
import { MessageFilterUtils } from '@/atoms/roomConfigAtom/types/messageFilter/utils';
import { MessageTabConfig } from '@/atoms/roomConfigAtom/types/messageTabConfig';

const generateTabName = (
    tabConfig: MessageTabConfig,
    publicChannelNames: ReturnType<typeof usePublicChannelNames>
): string => {
    if (tabConfig.tabName != null && tabConfig.tabName !== '') {
        return tabConfig.tabName;
    }

    if (MessageFilterUtils.isAll(tabConfig)) {
        return '全てのメッセージ';
    }
    if (MessageFilterUtils.isEmpty(tabConfig)) {
        return '空のタブ';
    }

    const elements: string[] = [];
    if (tabConfig.showNotification) {
        elements.push('ログ');
    }
    if (tabConfig.showSystem) {
        elements.push('システムメッセージ');
    }
    if (tabConfig.showFree) {
        elements.push('雑談');
    }
    strIndex10Array.forEach(index => {
        if (tabConfig[`showPublic${index}`]) {
            elements.push(
                publicChannelNames?.[`publicChannel${index}Name`] ?? `(チャンネル${index})`
            );
        }
    });
    if (tabConfig.privateChannels === true) {
        elements.push('秘話');
    } else if (typeof tabConfig.privateChannels === 'string') {
        elements.push('秘話(一部)');
    }
    if (elements.length >= 4) {
        return `複数のチャンネル`;
    }
    return elements.reduce((seed, elem, i) => {
        if (i === 0) {
            return elem;
        }
        return `${seed}, ${elem}`;
    }, '');
};

type Props = {
    tabConfig: MessageTabConfig;
};

export const MessageTabName: React.FC<Props> = ({ tabConfig }: Props) => {
    const publicChannelNames = usePublicChannelNames();

    return <div>{generateTabName(tabConfig, publicChannelNames)}</div>;
};
