import { castToNumber } from '../utils/cast';
import isObject from '../utils/isObject';

export type BoardConfig = {
    offsetX: number;
    offsetY: number;
    // ズーム倍率 = 2^zoom
    zoom: number;
}

export type PartialBoardConfig = Partial<BoardConfig>;

export const castToPartialBoardConfig = (source: unknown): PartialBoardConfig | undefined => {
    if (!isObject<PartialBoardConfig>(source)) {
        return;
    }
    return {
        offsetX: castToNumber(source.offsetX),
        offsetY: castToNumber(source.offsetY),
        zoom: castToNumber(source.zoom),
    };
};

export const toCompleteBoardConfig = (source: PartialBoardConfig): BoardConfig => {
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