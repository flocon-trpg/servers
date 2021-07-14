import { castToArray, castToBoolean, castToNumber, castToString } from '../utils/cast';
import isObject from '../utils/isObject';
import {
    castToPartialDraggablePanelConfigBase,
    DraggablePanelConfigBase,
    toCompleteDraggablePanelConfigBase,
} from './DraggablePanelConfigBase';
import * as generators from '../utils/generators';

export type MemoPanelConfig = {
    isMinimized: boolean;
    selectedMemoId?: string;
} & DraggablePanelConfigBase;

export type PartialMemoPanelConfig = Partial<MemoPanelConfig>;

export const castToPartialMemoPanelConfig = (
    source: unknown
): PartialMemoPanelConfig | undefined => {
    if (!isObject<PartialMemoPanelConfig>(source)) {
        return;
    }
    return {
        ...castToPartialDraggablePanelConfigBase(source),
        isMinimized: castToBoolean(source.isMinimized),
        selectedMemoId: castToString(source.selectedMemoId),
    };
};

export const toCompleteMemoPanelConfig = (source: PartialMemoPanelConfig): MemoPanelConfig => {
    return {
        ...toCompleteDraggablePanelConfigBase(source),
        isMinimized: source.isMinimized ?? false,
        selectedMemoId: source.selectedMemoId,
    };
};

export const defaultMemoPanelConfig = (): MemoPanelConfig => {
    return {
        x: 0,
        y: 400,
        width: 300,
        height: 300,
        zIndex: 0,
        isMinimized: false,
    };
};

export const defaultMemoPanelsConfig = (): Record<string, MemoPanelConfig> => {
    const result: Record<string, MemoPanelConfig> = {};
    const id = generators.simpleId();
    result[id] = defaultMemoPanelConfig();
    return result;
};
