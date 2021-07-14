import { castToNumber } from '../utils/cast';
import isObject from '../utils/isObject';

export type DraggablePanelConfigBase = {
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
};

export type PartialDraggablePanelConfigBase = Partial<DraggablePanelConfigBase>;

export const castToPartialDraggablePanelConfigBase = (
    source: unknown
): PartialDraggablePanelConfigBase | undefined => {
    if (!isObject<PartialDraggablePanelConfigBase>(source)) {
        return;
    }
    return {
        x: castToNumber(source.x),
        y: castToNumber(source.y),
        width: castToNumber(source.width),
        height: castToNumber(source.height),
        zIndex: castToNumber(source.zIndex),
    };
};

export const toCompleteDraggablePanelConfigBase = (
    source: PartialDraggablePanelConfigBase
): DraggablePanelConfigBase => {
    return {
        x: source.x ?? 0,
        y: source.y ?? 0,
        width: source.width ?? 300,
        height: source.height ?? 300,
        zIndex: source.zIndex ?? 0,
    };
};
