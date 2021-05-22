import { castToBoolean, castToNullableString, castToNumber, castToRecord } from '../utils/cast';
import isObject from '../utils/isObject';
import { castToPartialDraggablePanelConfigBase, DraggablePanelConfigBase, toCompleteDraggablePanelConfigBase } from './DraggablePanelConfigBase';
import { chooseRecord } from '../@shared/utils';
import { BoardConfig, castToPartialBoardConfig, defaultBoardConfig, PartialBoardConfig, toCompleteBoardConfig } from './BoardConfig';

export type ActiveBoardPanelConfig = {
    boards: Record<string, BoardConfig>;
    isMinimized: boolean;
} & DraggablePanelConfigBase

export type PartialActiveBoardPanelConfig = Omit<Partial<ActiveBoardPanelConfig>, 'boards'> & { boards?: Record<string, PartialBoardConfig> };

export const castToPartialActiveBoardPanelConfig = (source: unknown): PartialActiveBoardPanelConfig | undefined => {
    if (!isObject<PartialActiveBoardPanelConfig>(source)) {
        return;
    }

    return {
        ...castToPartialDraggablePanelConfigBase(source),
        boards: castToRecord(source.boards, castToPartialBoardConfig),
        isMinimized: castToBoolean(source.isMinimized),
    };
};

export const toCompleteActiveBoardPanelConfig = (source: PartialActiveBoardPanelConfig): ActiveBoardPanelConfig => {
    return {
        ...toCompleteDraggablePanelConfigBase(source),
        boards: chooseRecord(source.boards ?? {}, toCompleteBoardConfig),
        isMinimized: source.isMinimized ?? false,
    };
};

export const defaultActiveBoardPanelsConfig = (): ActiveBoardPanelConfig => {
    return {
        ...defaultBoardConfig(),
        boards: {},
        x: 0,
        y: 0,
        width: 400,
        height: 400,
        zIndex: -1,
        isMinimized: false,
    };
};