import { z } from 'zod';
import { defaultParticipantsPanelPosition } from '../defaultPanelPositions';
import {
    DraggablePanelConfigBase,
    deserializeDraggablePanelConfigBase,
    serializedDraggablePanelConfigBase,
} from '../draggablePanelConfig';

export type ParticipantsPanelConfig = {
    isMinimized: boolean;
} & DraggablePanelConfigBase;

export const serializedParticipantsPanelConfig = z
    .object({
        isMinimized: z.boolean(),
    })
    .partial()
    .merge(serializedDraggablePanelConfigBase);

export type SerializedParticipantsPanelConfig = z.TypeOf<typeof serializedParticipantsPanelConfig>;

export const deserializeParticipantsPanelConfig = (
    source: SerializedParticipantsPanelConfig
): ParticipantsPanelConfig => {
    return {
        ...deserializeDraggablePanelConfigBase(source),
        isMinimized: source.isMinimized ?? false,
    };
};

export const defaultParticipantsPanelConfig = (): ParticipantsPanelConfig => {
    return {
        ...defaultParticipantsPanelPosition,
    };
};
