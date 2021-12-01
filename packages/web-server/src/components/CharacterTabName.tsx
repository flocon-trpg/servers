import { strIndex10Array } from '@flocon-trpg/core';
import React from 'react';
import { CharacterTabConfig } from '../atoms/roomConfig/types/characterTabConfig';
import { CharacterTagFilterUtils } from '../atoms/roomConfig/types/characterTagFilter/utils';
import { useCharacterTagNames } from '../hooks/state/useCharacterTagNames';

const generateTabName = (
    tabConfig: CharacterTabConfig,
    characterTagNames: ReturnType<typeof useCharacterTagNames>
): string => {
    if (tabConfig.tabName != null && tabConfig.tabName !== '') {
        return tabConfig.tabName;
    }

    if (CharacterTagFilterUtils.isAll(tabConfig)) {
        return '全てのキャラクター';
    }
    if (CharacterTagFilterUtils.isEmpty(tabConfig)) {
        return '空のタブ';
    }

    const elements: string[] = [];
    if (tabConfig.showNoTag) {
        elements.push('タグなし');
    }
    strIndex10Array.forEach(index => {
        if (tabConfig[`showTag${index}`]) {
            elements.push(characterTagNames?.[`characterTag${index}Name`] ?? `(タグ${index})`);
        }
    });
    if (elements.length >= 5) {
        return `複数のタグ`;
    }
    return elements.reduce((seed, elem, i) => {
        if (i === 0) {
            return elem;
        }
        return `${seed}, ${elem}`;
    }, '');
};

type Props = {
    tabConfig: CharacterTabConfig;
};

export const CharacterTabName: React.FC<Props> = ({ tabConfig }: Props) => {
    const characterTagNames = useCharacterTagNames();

    return <div>{generateTabName(tabConfig, characterTagNames)}</div>;
};
