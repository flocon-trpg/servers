import * as t from 'io-ts';

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

export const serializedCharacterTagFilter = t.partial({
    showNoTag: t.boolean,
    showTag1: t.boolean,
    showTag2: t.boolean,
    showTag3: t.boolean,
    showTag4: t.boolean,
    showTag5: t.boolean,
    showTag6: t.boolean,
    showTag7: t.boolean,
    showTag8: t.boolean,
    showTag9: t.boolean,
    showTag10: t.boolean,
});

export type SerializedCharacterTagFilter = t.TypeOf<typeof serializedCharacterTagFilter>;

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
