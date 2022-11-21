import { z } from 'zod';

export type CharacterTagFilter = {
    showNoTag: boolean;
    showTag1: boolean;
    showTag2: boolean;
    showTag3: boolean;
    showTag4: boolean;
    showTag5: boolean;
    showTag6: boolean;
    showTag7: boolean;
    showTag8: boolean;
    showTag9: boolean;
    showTag10: boolean;
};

export const serializedCharacterTagFilter = z
    .object({
        showNoTag: z.boolean(),
        showTag1: z.boolean(),
        showTag2: z.boolean(),
        showTag3: z.boolean(),
        showTag4: z.boolean(),
        showTag5: z.boolean(),
        showTag6: z.boolean(),
        showTag7: z.boolean(),
        showTag8: z.boolean(),
        showTag9: z.boolean(),
        showTag10: z.boolean(),
    })
    .partial();

export type SerializedCharacterTagFilter = z.TypeOf<typeof serializedCharacterTagFilter>;

export const deserializeCharacterTagFilter = (
    source: SerializedCharacterTagFilter
): CharacterTagFilter => {
    return {
        showNoTag: source.showNoTag ?? false,
        showTag1: source.showTag1 ?? false,
        showTag2: source.showTag2 ?? false,
        showTag3: source.showTag3 ?? false,
        showTag4: source.showTag4 ?? false,
        showTag5: source.showTag5 ?? false,
        showTag6: source.showTag6 ?? false,
        showTag7: source.showTag7 ?? false,
        showTag8: source.showTag8 ?? false,
        showTag9: source.showTag9 ?? false,
        showTag10: source.showTag10 ?? false,
    };
};
