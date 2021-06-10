import { castToBoolean } from '../utils/cast';
import isObject from '../utils/isObject';
import { castToPartialDraggablePanelConfigBase, DraggablePanelConfigBase, toCompleteDraggablePanelConfigBase } from './DraggablePanelConfigBase';

export type PieceValuePanelConfig = {
    isMinimized: boolean;
} & DraggablePanelConfigBase

export type PartialPieceValuePanelConfig = Partial<PieceValuePanelConfig>;

export const castToPartialPieceValuePanelConfig = (source: unknown): PartialPieceValuePanelConfig | undefined => {
    if (!isObject<PartialPieceValuePanelConfig>(source)) {
        return;
    }
    return {
        ...castToPartialDraggablePanelConfigBase(source),
        isMinimized: castToBoolean(source.isMinimized),
    };
};

export const toCompletePieceValuePanelConfig = (source: PartialPieceValuePanelConfig): PieceValuePanelConfig => {
    return {
        ...toCompleteDraggablePanelConfigBase(source),
        isMinimized: source.isMinimized ?? false,
    };
};

export const defaultPieceValuePanelConfig = (): PieceValuePanelConfig => {
    return {
        x: 1000,
        y: 400,
        width: 300,
        height: 300,
        zIndex: 0,
        isMinimized: false,
    };
};