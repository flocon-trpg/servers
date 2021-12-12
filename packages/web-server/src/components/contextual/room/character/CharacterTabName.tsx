import { strIndex10Array } from '@flocon-trpg/core';
import React from 'react';
import { CharacterTabConfig } from '../../../../atoms/roomConfig/types/characterTabConfig';
import { useCharacterTagNames } from '../../../../hooks/state/useCharacterTagNames';

const generateTabName = (
    tabConfig: CharacterTabConfig,
    characterTagNames: ReturnType<typeof useCharacterTagNames>
): string => {
    if (tabConfig.tabName != null && tabConfig.tabName !== '') {
        return tabConfig.tabName;
    }

    let isAll = true;
    let isEmpty = true;
    const names: string[] = [];
    if (tabConfig.showNoTag) {
        names.push('タグなし');
        isEmpty = false;
    } else {
        isAll = false;
    }

    strIndex10Array.forEach(index => {
        const characterTagName = characterTagNames[`characterTag${index}Name`];
        if (characterTagName == null) {
            return;
        }

        if (tabConfig[`showTag${index}`]) {
            names.push(characterTagName);
            isEmpty = false;
        } else {
            isAll = false;
        }
    });

    if (isEmpty) {
        return '空のタブ';
    }
    if (isAll) {
        return '全てのキャラクター';
    }
    if (names.length >= 4) {
        return `タブ`;
    }
    return names.reduce((seed, elem, i) => {
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
