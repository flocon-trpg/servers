import { z } from 'zod';
import { defaultGameEffectPanelPosition } from '../defaultPanelPositions';
import {
    DraggablePanelConfigBase,
    deserializeDraggablePanelConfigBase,
    serializedDraggablePanelConfigBase,
} from '../draggablePanelConfig';

export type GameEffectPanelConfig = {
    isMinimized: boolean;
} & DraggablePanelConfigBase;

export const serializedGameEffectPanelConfig = z
    .object({
        isMinimized: z.boolean(),
    })
    .partial()
    .merge(serializedDraggablePanelConfigBase);

export type SerializedGameEffectPanelConfig = z.TypeOf<typeof serializedGameEffectPanelConfig>;

export const deserializeGameEffectPanelConfig = (
    source: SerializedGameEffectPanelConfig
): GameEffectPanelConfig => {
    return {
        ...deserializeDraggablePanelConfigBase(source),
        isMinimized: source.isMinimized ?? false,
    };
};

export const defaultGameEffectPanelConfig = (): GameEffectPanelConfig => {
    return {
        ...defaultGameEffectPanelPosition,
    };
};
