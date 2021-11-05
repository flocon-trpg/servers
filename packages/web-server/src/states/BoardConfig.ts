import * as t from 'io-ts';

export type BoardConfig = {
    offsetX: number;
    offsetY: number;
    // ズーム倍率 = 2^zoom
    zoom: number;
    showGrid: boolean;
    gridLineTension: number;
    gridLineColor: string;
};

export const serializedBoardConfig = t.partial({
    offsetX: t.number,
    offsetY: t.number,
    zoom: t.number,
    showGrid: t.boolean,
    gridLineTension: t.number,
    gridLineColor: t.string,
});

export type SerializedBoardConfig = t.TypeOf<typeof serializedBoardConfig>;

export const toCompleteBoardConfig = (source: SerializedBoardConfig): BoardConfig => {
    return {
        offsetX: source.offsetX ?? 0,
        offsetY: source.offsetY ?? 0,
        zoom: source.zoom ?? 1,
        showGrid: source.showGrid ?? false,
        gridLineTension: source.gridLineTension ?? 1,
        gridLineColor: source.gridLineColor ?? 'rgba(0, 0, 0, 1)',
    };
};

export const defaultBoardConfig = (): BoardConfig => ({
    offsetX: 0,
    offsetY: 0,
    zoom: 0,
    showGrid: false,
    gridLineTension: 1,
    gridLineColor: 'rgba(0, 0, 0, 1)',
});
