import { simpleId } from '@flocon-trpg/core';
import { CharacterTabConfig } from '.';
import { CharacterTagFilterUtils } from '../characterTagFilter/utils';

export namespace CharacterTabConfigUtils {
    export const createEmpty = ({ tabName }: { tabName?: string }): CharacterTabConfig => {
        return {
            ...CharacterTagFilterUtils.createEmpty(),
            key: simpleId(),
            tabName,
        };
    };

    export const createAll = ({ tabName }: { tabName?: string }): CharacterTabConfig => {
        return {
            ...CharacterTagFilterUtils.createAll(),
            key: simpleId(),
            tabName,
        };
    };
}
