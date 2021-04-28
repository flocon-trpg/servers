import { castToBoolean } from '../utils/cast';
import isObject from '../utils/isObject';
import { castToPartialDraggablePanelConfigBase, DraggablePanelConfigBase, toCompleteDraggablePanelConfigBase } from './DraggablePanelConfigBase';

export type MyValuePanelConfig = {
    isMinimized: boolean;
} & DraggablePanelConfigBase

export type PartialMyValuePanelConfig = Partial<MyValuePanelConfig>;

export const castToPartialMyValuePanelConfig = (source: unknown): PartialMyValuePanelConfig | undefined => {
    if (!isObject<PartialMyValuePanelConfig>(source)) {
        return;
    }
    return {
        ...castToPartialDraggablePanelConfigBase(source),
        isMinimized: castToBoolean(source.isMinimized),
    };
};

export const toCompleteMyValuePanelConfig = (source: PartialMyValuePanelConfig): MyValuePanelConfig => {
    return {
        ...toCompleteDraggablePanelConfigBase(source),
        isMinimized: source.isMinimized ?? false,
    };
};

export const defaultMyValuePanelConfig = (): MyValuePanelConfig => {
    return {
        x: 1000,
        y: 400,
        width: 300,
        height: 300,
        zIndex: 0,
        isMinimized: false,
    };
};