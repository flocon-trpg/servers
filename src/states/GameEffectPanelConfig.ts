import { castToBoolean } from '../utils/cast';
import isObject from '../utils/isObject';
import {
    castToPartialDraggablePanelConfigBase,
    DraggablePanelConfigBase,
    toCompleteDraggablePanelConfigBase,
} from './DraggablePanelConfigBase';

export type GameEffectPanelConfig = {
    isMinimized: boolean;
} & DraggablePanelConfigBase;

export type PartialGameEffectPanelConfig = Partial<GameEffectPanelConfig>;

export const castToPartialGameEffectPanelConfig = (
    source: unknown
): PartialGameEffectPanelConfig | undefined => {
    if (!isObject<PartialGameEffectPanelConfig>(source)) {
        return;
    }
    return {
        ...castToPartialDraggablePanelConfigBase(source),
        isMinimized: castToBoolean(source.isMinimized),
    };
};

export const toCompleteGameEffectPanelConfig = (
    source: PartialGameEffectPanelConfig
): GameEffectPanelConfig => {
    return {
        ...toCompleteDraggablePanelConfigBase(source),
        isMinimized: source.isMinimized ?? false,
    };
};

export const defaultGameEffectPanelConfig = (): GameEffectPanelConfig => {
    return {
        x: 600,
        y: 400,
        width: 300,
        height: 300,
        zIndex: 0,
        isMinimized: false,
    };
};
