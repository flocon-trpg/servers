import { castToBoolean, castToNullableString, castToNumber, castToRecord } from '../utils/cast';
import isObject from '../utils/isObject';
import { castToPartialDraggablePanelConfigBase, DraggablePanelConfigBase, toCompleteDraggablePanelConfigBase } from './DraggablePanelConfigBase';
import * as generators from '../utils/generators';
import { chooseRecord } from '../@shared/utils';
import { BoardConfig, castToPartialBoardConfig, PartialBoardConfig, toCompleteBoardConfig } from './BoardConfig';

export type BoardEditorPanelConfig = {
    activeBoardKey: string | null;
    boards: Record<string, BoardConfig>;
    isMinimized: boolean;
} & DraggablePanelConfigBase

export type PartialBoardEditorPanelConfig = Omit<Partial<BoardEditorPanelConfig>, 'boards'> & { boards?: Record<string, PartialBoardConfig> };

export const castToPartialBoardEditorPanelConfig = (source: unknown): PartialBoardEditorPanelConfig | undefined => {
    if (!isObject<PartialBoardEditorPanelConfig>(source)) {
        return;
    }
    
    return {
        ...castToPartialDraggablePanelConfigBase(source),
        activeBoardKey: castToNullableString(source.activeBoardKey),
        boards: castToRecord(source.boards, castToPartialBoardConfig),
        isMinimized: castToBoolean(source.isMinimized),
    };
};

export const toCompleteBoardEditorPanelConfig = (source: PartialBoardEditorPanelConfig): BoardEditorPanelConfig => {
    return {
        ...toCompleteDraggablePanelConfigBase(source),
        activeBoardKey: source.activeBoardKey ?? null,
        boards: chooseRecord(source.boards ?? {}, toCompleteBoardConfig),
        isMinimized: source.isMinimized ?? false,
    };
};

export const defaultBoardEditorPanelsConfig = (): Record<string, BoardEditorPanelConfig> => {
    const config: BoardEditorPanelConfig = {
        x: 0,
        y: 0,
        width: 400,
        height: 400,
        zIndex: -1,
        activeBoardKey: null,
        boards: {},
        isMinimized: false,
    };
    const result: Record<string, BoardEditorPanelConfig> = {};
    const id = generators.simpleId();
    result[id] = config;
    return result;
};