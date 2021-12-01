import { CharacterTagFilter } from '.';

export namespace CharacterTagFilterUtils {
    export const isEmpty = (source: CharacterTagFilter): boolean => {
        return (
            !source.showNoTag &&
            !source.showTag1 &&
            !source.showTag10 &&
            !source.showTag2 &&
            !source.showTag3 &&
            !source.showTag4 &&
            !source.showTag5 &&
            !source.showTag6 &&
            !source.showTag7 &&
            !source.showTag8 &&
            !source.showTag9
        );
    };

    export const isAll = (source: CharacterTagFilter): boolean => {
        return (
            source.showNoTag &&
            source.showTag1 &&
            source.showTag10 &&
            source.showTag2 &&
            source.showTag3 &&
            source.showTag4 &&
            source.showTag5 &&
            source.showTag6 &&
            source.showTag7 &&
            source.showTag8 &&
            source.showTag9
        );
    };

    export const createEmpty = (): CharacterTagFilter => {
        return {
            showNoTag: false,
            showTag1: false,
            showTag10: false,
            showTag2: false,
            showTag3: false,
            showTag4: false,
            showTag5: false,
            showTag6: false,
            showTag7: false,
            showTag8: false,
            showTag9: false,
        };
    };

    export const createAll = (): CharacterTagFilter => {
        return {
            showNoTag: true,
            showTag1: true,
            showTag10: true,
            showTag2: true,
            showTag3: true,
            showTag4: true,
            showTag5: true,
            showTag6: true,
            showTag7: true,
            showTag8: true,
            showTag9: true,
        };
    };
}
