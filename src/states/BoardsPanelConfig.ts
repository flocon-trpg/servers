import { castToBoolean, castToNullableString, castToNumber, castToRecord, castToString } from '../utils/cast';
import isObject from '../utils/isObject';
import { chooseRecord } from '../utils/record';
import { castToPartialDraggablePanelConfigBase, DraggablePanelConfigBase, toCompleteDraggablePanelConfigBase } from './DraggablePanelConfigBase';
import * as generators from '../utils/generators';

export type BoardConfig = {
    offsetX: number;
    offsetY: number;
    // ズーム倍率 = 2^zoom
    zoom: number;
}

export type PartialBoardConfig = Partial<BoardConfig>;

const castToPartialBoardConfig = (source: unknown): PartialBoardConfig | undefined => {
    if (!isObject<PartialBoardConfig>(source)) {
        return;
    }
    return {
        offsetX: castToNumber(source.offsetX),
        offsetY: castToNumber(source.offsetY),
        zoom: castToNumber(source.zoom),
    };
};

const toCompleteBoardConfig = (source: PartialBoardConfig): BoardConfig => {
    return {
        offsetX: source.offsetX ?? 0,
        offsetY: source.offsetY ?? 0,
        zoom: source.zoom ?? 1,
    };
};

export const createDefaultBoardConfig = (): BoardConfig => ({
    offsetX: 0,
    offsetY: 0,
    zoom: 0,
});

export type BoardsPanelConfig = {
    activeBoardKey: string | null;
    boards: Record<string, BoardConfig>;
    isMinimized: boolean;
} & DraggablePanelConfigBase

export type PartialBoardsPanelConfig = Omit<Partial<BoardsPanelConfig>, 'boards'> & { boards?: Record<string, PartialBoardConfig> };

export const castToPartialBoardsPanelConfig = (source: unknown): PartialBoardsPanelConfig | undefined => {
    if (!isObject<PartialBoardsPanelConfig>(source)) {
        return;
    }
    
    return {
        ...castToPartialDraggablePanelConfigBase(source),
        activeBoardKey: castToNullableString(source.activeBoardKey),
        boards: castToRecord(source.boards, castToPartialBoardConfig),
        isMinimized: castToBoolean(source.isMinimized),
    };
};

export const toCompleteBoardsPanelConfig = (source: PartialBoardsPanelConfig): BoardsPanelConfig => {
    return {
        ...toCompleteDraggablePanelConfigBase(source),
        activeBoardKey: source.activeBoardKey ?? null,
        boards: chooseRecord(source.boards ?? {}, toCompleteBoardConfig),
        isMinimized: source.isMinimized ?? false,
    };
};

export const defaultBoardsPanelsConfig = (): Record<string, BoardsPanelConfig> => {
    const config: BoardsPanelConfig = {
        x: 0,
        y: 0,
        width: 400,
        height: 400,
        zIndex: -1,
        activeBoardKey: null,
        boards: {},
        isMinimized: false,
    };
    const result: Record<string, BoardsPanelConfig> = {};
    const id = generators.simpleId();
    result[id] = config;
    return result;
};