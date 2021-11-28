import * as t from 'io-ts';
import { defaultParticipantsPanelPosition } from '../defaultPanelPositions';
import {
    deserializeDraggablePanelConfigBase,
    DraggablePanelConfigBase,
    serializedDraggablePanelConfigBase,
} from '../draggablePanelConfig';

export type ParticipantsPanelConfig = {
    isMinimized: boolean;
} & DraggablePanelConfigBase;

export const serializedParticipantsPanelConfig = t.intersection([
    t.partial({
        isMinimized: t.boolean,
    }),
    serializedDraggablePanelConfigBase,
]);

export type SerializedParticipantsPanelConfig = t.TypeOf<typeof serializedParticipantsPanelConfig>;

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
