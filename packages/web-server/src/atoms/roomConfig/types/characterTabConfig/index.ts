import * as t from 'io-ts';
import {
    CharacterTagFilter,
    deserializeCharacterTagFilter,
    serializedCharacterTagFilter,
} from '../characterTagFilter';

export type CharacterTabConfig = {
    key: string;

    // nullishならば自動で名付けられる
    tabName?: string;
} & CharacterTagFilter;

export const partialCharacterTabConfig = t.intersection([
    t.type({ key: t.string }),
    t.partial({
        tabName: t.string,
    }),
    serializedCharacterTagFilter,
]);

export const deserializeCharacterTabConfig = (
    source: PartialCharacterTabConfig
): CharacterTabConfig => {
    return {
        ...deserializeCharacterTagFilter(source),
        key: source.key,
        tabName: source.tabName,
    };
};

export type PartialCharacterTabConfig = t.TypeOf<typeof partialCharacterTabConfig>;
