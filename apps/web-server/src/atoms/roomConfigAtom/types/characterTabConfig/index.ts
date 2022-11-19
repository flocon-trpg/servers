import { z } from 'zod';
import {
    CharacterTagFilter,
    deserializeCharacterTagFilter,
    serializedCharacterTagFilter,
} from '../characterTagFilter';

export type CharacterTabConfig = {
    // 同一Panel内にある他のCharacterTabConfigのkeyと重複しないようにしなければならない
    key: string;

    // nullishならば自動で名付けられる
    tabName?: string;
} & CharacterTagFilter;

export const partialCharacterTabConfig = z
    .object({ key: z.string() })
    .merge(
        z
            .object({
                tabName: z.string(),
            })
            .partial()
    )
    .merge(serializedCharacterTagFilter);

export const deserializeCharacterTabConfig = (
    source: PartialCharacterTabConfig
): CharacterTabConfig => {
    return {
        ...deserializeCharacterTagFilter(source),
        key: source.key,
        tabName: source.tabName,
    };
};

export type PartialCharacterTabConfig = z.TypeOf<typeof partialCharacterTabConfig>;
