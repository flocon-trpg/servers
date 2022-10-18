import { simpleId } from '@flocon-trpg/core';
import { CharacterTagFilterUtils } from '../characterTagFilter/utils';
import { CharacterTabConfig } from '.';

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
