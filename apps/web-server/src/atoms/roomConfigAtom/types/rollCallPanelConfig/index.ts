import { z } from 'zod';
import { defaultRollCallPanelPosition } from '../defaultPanelPositions';
import {
    DraggablePanelConfigBase,
    deserializeDraggablePanelConfigBase,
    serializedDraggablePanelConfigBase,
} from '../draggablePanelConfig';

export type RollCallPanelConfig = {
    isMinimized: boolean;
} & DraggablePanelConfigBase;

export const serializedRollCallPanelConfig = z
    .object({
        isMinimized: z.boolean(),
    })
    .partial()
    .merge(serializedDraggablePanelConfigBase);

export type SerializedRollCallPanelConfig = z.TypeOf<typeof serializedRollCallPanelConfig>;

export const deserializeRollCallPanelConfig = (
    source: SerializedRollCallPanelConfig
): RollCallPanelConfig => {
    return {
        ...deserializeDraggablePanelConfigBase(source),
        isMinimized: source.isMinimized ?? false,
    };
};

export const defaultRollCallPanelConfig = (): RollCallPanelConfig => {
    return {
        ...defaultRollCallPanelPosition,
    };
};
