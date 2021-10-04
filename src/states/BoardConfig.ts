import * as t from 'io-ts';

export type BoardConfig = {
    offsetX: number;
    offsetY: number;
    // ズーム倍率 = 2^zoom
    zoom: number;
};

export const serializedBoardConfig = t.partial({
    offsetX: t.number,
    offsetY: t.number,
    zoom: t.number,
});

export type SerializedBoardConfig = t.TypeOf<typeof serializedBoardConfig>;

export const toCompleteBoardConfig = (source: SerializedBoardConfig): BoardConfig => {
    return {
        offsetX: source.offsetX ?? 0,
        offsetY: source.offsetY ?? 0,
        zoom: source.zoom ?? 1,
    };
};

export const defaultBoardConfig = (): BoardConfig => ({
    offsetX: 0,
    offsetY: 0,
    zoom: 0,
});
